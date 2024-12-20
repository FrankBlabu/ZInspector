/*!
 * lib.rs - Rust code for the backend
 *
 * This file exposes the interface of the backebd to the node.
 */

use lazy_static::lazy_static;
use neon::prelude::*;
use std::sync::Mutex;

// Global buffer keeping the loaded STL data
lazy_static! {
    static ref STL_DATA: Mutex<Option<Vec<u8>>> = Mutex::new(None);
}

fn get_num_cpus(mut cx: FunctionContext) -> JsResult<JsNumber> {
    Ok(cx.number(num_cpus::get() as f64))
}

fn load_file(mut cx: FunctionContext) -> JsResult<JsBuffer> {
    let path = cx.argument::<JsString>(0)?;
    let path_s: String = path.value(&mut cx);

    log::debug!("Loading file: {}", path_s);

    // Load file in binary mode into the global buffer
    let data: Vec<u8> = std::fs::read(&path_s).expect("Failed to read file");

    // Store the data in the global buffer
    {
        let mut stl_data = STL_DATA.lock().unwrap();
        *stl_data = Some(data.clone());
        log::debug!("Buffer size is now: {}", stl_data.as_ref().unwrap().len());
    }

    // Create buffer and copy the content of 'STL_DATA' into it
    let mut buffer = JsBuffer::new(&mut cx, data.len())?;
    Ok(buffer)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    env_logger::init();

    log::info!("Initializing backend");

    cx.export_function("get_num_cpus", get_num_cpus)?;
    cx.export_function("load_file", load_file)?;
    Ok(())
}
