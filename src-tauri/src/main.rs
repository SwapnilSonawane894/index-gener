#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::{CommandEvent, CommandChild};
use tauri::{Manager, RunEvent};
use std::sync::Mutex;

// 1. Create a struct to hold the child process safely across threads
struct SharedChild {
    child: Mutex<Option<CommandChild>>,
}

fn main() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // 2. Start the Python Sidecar
            let (mut rx, child) = app.shell().sidecar("server")
                .expect("failed to create `server` binary command")
                .spawn()
                .expect("Failed to spawn sidecar");

            // 3. Store the child process in the global state
            app.manage(SharedChild {
                child: Mutex::new(Some(child)),
            });

            // 4. Logging (Optional but helpful)
            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    match event {
                        CommandEvent::Stdout(line) => {
                            println!("Python: {}", String::from_utf8_lossy(&line));
                        }
                        CommandEvent::Stderr(line) => {
                            println!("Python ERR: {}", String::from_utf8_lossy(&line));
                        }
                        _ => {}
                    }
                }
            });

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    // 5. Run the application loop
    app.run(|app_handle, event| {
        match event {
            // This event triggers exactly when the app is about to quit (Cmd+Q or Red X)
            RunEvent::ExitRequested { .. } => {
                let state = app_handle.state::<SharedChild>();
                let mut child_guard = state.child.lock().unwrap();

                if let Some(child) = child_guard.take() {
                    println!("🛑 Terminating Python backend...");
                    let _ = child.kill(); // Sends the kill signal
                }
            }
            _ => {}
        }
    });
}