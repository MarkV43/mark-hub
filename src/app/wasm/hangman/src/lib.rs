mod utils;

use wasm_bindgen::prelude::*;
use std::collections::HashMap;
use std::str;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub struct Hangman {
  arrays: HashMap<usize, Vec<u8>>,
  data: Vec<u8>,
}

#[wasm_bindgen]
impl Hangman {
  pub fn new() -> Hangman {
    Hangman {
      arrays: HashMap::new(),
      data: vec![0; 50],
    }
  }

  pub fn get_data_pointer(&self) -> *const u8 {
    self.data.as_ptr()
  }

  pub fn create_array_for_size(&mut self, word_length: usize, size: usize) -> *const u8 {
    let array = vec![0; size * word_length];
    let pointer = array.as_ptr();
    self.arrays.insert(word_length, array);
    pointer
  }

  //noinspection RsSelfConvention
  pub fn get_word(&mut self, word_length: usize, position: usize) {
    let macro_array = self.arrays.get(&word_length).unwrap();
    // let result = &macro_array[(position * word_length)..((position + 1) * word_length)];
    self.data.truncate(word_length);
    // self.data.copy_from_slice(result);
    let mut j = 0;
    for i in position*word_length..(position+1)*word_length {
      self.data[j] = macro_array[i];
      j += 1;
    }
  }

  pub fn get_data(&self) -> String {
    /*let s = str::from_utf8(&self.data).unwrap();

    alert(s);*/

    String::from_utf8(self.data.clone()).unwrap()
  }
}
