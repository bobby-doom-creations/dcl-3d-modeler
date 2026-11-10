fn main() {
  tauri::build(tauri::lib::builder()
    .tauri_config(tauri::lib::Config::load("src-tauri/tauri.conf.json").expect("Failed to load Tauri config"))
    .build()
  );
}
