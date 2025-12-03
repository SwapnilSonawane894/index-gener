#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::{CommandEvent, CommandChild};
use tauri::{Manager, RunEvent};
use std::sync::Mutex;

struct SharedChild {
    child: Mutex<Option<CommandChild>>,
}

fn main() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let (mut rx, child) = app.shell().sidecar("server")
                .expect("failed to create `server` binary command")
                .spawn()
                .expect("Failed to spawn sidecar");

            app.manage(SharedChild {
                child: Mutex::new(Some(child)),
            });

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

    app.run(|app_handle, event| {
        if let RunEvent::ExitRequested { .. } = event {
            let state = app_handle.state::<SharedChild>();
            let mut child_guard = state.child.lock().unwrap();
            if let Some(child) = child_guard.take() {
                println!("🛑 Killing Python backend...");
                let _ = child.kill();
            }
        }
    });
}