mod utils;

use wasm_bindgen::prelude::*;
use rand::seq::SliceRandom;
use rand::{Rng, thread_rng};
use crate::utils::set_panic_hook;

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
pub fn greet() {
  alert("Hello, fabrik-algorithm!");
}


#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Vector {
  pub x: f32,
  pub y: f32,
}

fn inv_sqrt(x: f32) -> f32 {
  let i = x.to_bits();
  let i = 0x5f3759df - (i >> 1);
  let y = f32::from_bits(i);

  y * (1.5 - 0.5 * x * y * y)
}

impl Vector {
  #![allow(dead_code)]
  fn normalize(&mut self) {
    let inv_length = inv_sqrt(self.length_sq());
    self.x *= inv_length;
    self.y *= inv_length;
  }

  fn normalized(&self) -> Vector {
    let inv_length = inv_sqrt(self.length_sq());
    Vector {
      x: self.x * inv_length,
      y: self.y * inv_length,
    }
  }

  fn length_sq(&self) -> f32 {
    self.x * self.x + self.y * self.y
  }

  fn magnitude(&self) -> f32 {
    self.length_sq().sqrt()
  }
}

impl std::ops::Sub for Vector {
  type Output = Vector;

  fn sub(self, other: Vector) -> Vector {
    Vector {
      x: self.x - other.x,
      y: self.y - other.y,
    }
  }
}

impl std::ops::Sub for &Vector {
  type Output = Vector;

  fn sub(self, other: &Vector) -> Vector {
    Vector {
      x: self.x - other.x,
      y: self.y - other.y,
    }
  }
}

impl std::ops::AddAssign for Vector {
  fn add_assign(&mut self, other: Self) {
    self.x += other.x;
    self.y += other.y;
  }
}

impl std::ops::Add for Vector {
  type Output = Vector;

  fn add(self, other: Vector) -> Vector {
    Vector {
      x: self.x + other.x,
      y: self.y + other.y,
    }
  }
}

impl std::ops::Add for &Vector {
  type Output = Vector;

  fn add(self, other: &Vector) -> Vector {
    Vector {
      x: self.x + other.x,
      y: self.y + other.y,
    }
  }
}

impl std::ops::Div<f32> for Vector {
  type Output = Vector;

  fn div(self, other: f32) -> Vector {
    Vector {
      x: self.x / other,
      y: self.y / other,
    }
  }
}

impl std::ops::Div<f32> for &Vector {
  type Output = Vector;

  fn div(self, other: f32) -> Vector {
    Vector {
      x: self.x / other,
      y: self.y / other,
    }
  }
}

impl std::ops::Mul<f32> for Vector {
  type Output = Vector;

  fn mul(self, other: f32) -> Vector {
    Vector {
      x: self.x * other,
      y: self.y * other,
    }
  }
}

impl std::ops::Mul<f32> for &Vector {
  type Output = Vector;

  fn mul(self, other: f32) -> Vector {
    Vector {
      x: self.x * other,
      y: self.y * other,
    }
  }
}

#[derive(Debug, PartialEq)]
pub struct Stick {
  a: usize,
  b: usize,
}

#[wasm_bindgen]
pub struct Simulator {
  points: Vec<Vector>,
  old_pos: Vec<Vector>,
  locked: Vec<bool>,
  sticks: Vec<Stick>,
  sizes: Vec<f32>,
  iterations: usize,
  shuffle: bool,
}

#[wasm_bindgen]
impl Simulator {
  pub fn new(iterations: usize) -> Simulator {
    Simulator {
      points: vec![],
      old_pos: vec![],
      locked: vec![],
      sticks: vec![],
      sizes: vec![],
      iterations,
      shuffle: true,
    }
  }

  /**
   * Generates random points and random sticks.
   * Unfortunately tends to generate uneven triangles,
   * Making the simulation very unstable.
   */
  pub fn new_random(n_points: usize, n_sticks: usize, iterations: usize) -> Simulator {
    // Initialize vectors
    let mut points = Vec::with_capacity(n_points);
    let mut old_pos = Vec::with_capacity(n_points);
    let mut locked = Vec::with_capacity(n_points);
    let mut sticks = Vec::with_capacity(n_sticks);
    let mut sizes = Vec::with_capacity(n_sticks);

    let mut rng = thread_rng();

    // Fill points vector
    for i in 0..n_points {
      let x = rng.gen_range(-1.0..1.0);
      let y = rng.gen_range(-1.0..1.0);
      points.push(Vector { x, y });
      old_pos.push(Vector { x, y });
      locked.push(i == 0);
    }

    // Fill sticks vector with random points with components from -1 to 1
    for _ in 0..n_sticks {
      loop {
        let a = rng.gen_range(0..n_points);
        let mut b;

        // Guarantee that a != b
        loop {
          b = rng.gen_range(0..n_points);
          if a != b {
            break;
          }
        }

        // Guarantee that stick is unique
        if !sticks.iter().any(|stick: &Stick| stick.a == a && stick.b == b) {
          let pa = &points[a];
          let pb = &points[b];

          let size = (pa - pb).magnitude();

          sticks.push(Stick { a, b });
          sizes.push(size);
          break;
        }
      }
    }

    Simulator {
      points,
      old_pos,
      locked,
      sticks,
      sizes,
      iterations,
      shuffle: true,
    }
  }

  pub fn new_strip(n_sticks: usize, angle: f32, strip_len: f32, iterations: usize) -> Simulator {
    // Initialize vectors
    let mut points = Vec::with_capacity(n_sticks);
    let mut old_pos = Vec::with_capacity(n_sticks);
    let mut locked = Vec::with_capacity(n_sticks);
    let mut sticks = Vec::with_capacity(n_sticks);
    let mut sizes = Vec::with_capacity(n_sticks);

    points.push(Vector { x: 0.0, y: 0.0 });
    old_pos.push(Vector { x: 0.0, y: 0.0 });
    locked.push(true);

    let inv = 1.0 / (n_sticks as f32);

    for i in 1..=n_sticks {
      let x = strip_len * angle.cos() * (i as f32 * inv);
      let y = strip_len * angle.sin() * (i as f32 * inv);
      points.push(Vector { x, y });
      old_pos.push(Vector { x, y });
      locked.push(false);
      sticks.push(Stick { a: i - 1, b: i });
      sizes.push((points[i - 1] - points[i]).magnitude());
    }

    Simulator {
      points,
      old_pos,
      locked,
      sticks,
      sizes,
      iterations,
      shuffle: true,
    }
  }

  pub fn new_grid(n_cols: usize, n_rows: usize, min_x: f32, max_x: f32, min_y: f32, max_y: f32, n_locked: usize, iterations: usize) -> Simulator {
    set_panic_hook();

    // Initialize vectors
    let mut points = Vec::with_capacity(n_cols * n_rows);
    let mut old_pos = Vec::with_capacity(n_cols * n_rows);
    let mut locked = Vec::with_capacity(n_cols * n_rows);
    let mut sticks = Vec::with_capacity(n_rows * (n_cols - 1) + n_cols * (n_rows - 1));
    let mut sizes = Vec::with_capacity(n_rows * (n_cols - 1) + n_cols * (n_rows - 1));

    let min_spacing = (n_cols - n_locked) / (n_locked - 1);
    let rem = (n_cols - n_locked) % (n_locked - 1);

    let mut spacings = vec![min_spacing; n_locked - 1];

    let mut i = 0;
    for _ in 0..(rem >> 1) {
      // Increment first and last indexes
      spacings[i] += 1;
      spacings[n_locked - 2 - i] += 1;
      i += 1;
    }

    if rem % 2 == 1 {
      spacings[n_locked / 2 - 1] += 1;
    }

    let mut acc = vec![0; n_locked];
    for i in 0..(n_locked - 1) {
      acc[i + 1] = acc[i] + spacings[i] + 1;
    }

    for i in 0..n_cols {
      for j in 0..n_rows {
        let x = min_x + (max_x - min_x) * (i as f32 / (n_cols - 1) as f32);
        let y = min_y + (max_y - min_y) * (j as f32 / (n_rows - 1) as f32);
        points.push(Vector { x, y });
        old_pos.push(Vector { x, y });
        locked.push(j + 1 == n_rows && acc.contains(&i));

        if j > 0 {
          sticks.push(Stick { a: i * n_rows + j, b: i * n_rows + j - 1 });
          sizes.push((points[i * n_rows + j] - points[i * n_rows + j - 1]).magnitude());
        }
        if i > 0 {
          sticks.push(Stick { a: i * n_rows + j, b: (i - 1) * n_rows + j });
          sizes.push((points[i * n_rows + j] - points[(i - 1) * n_rows + j]).magnitude());
        }
      }
    }

    Simulator {
      points,
      old_pos,
      locked,
      sticks,
      sizes,
      iterations,
      shuffle: true,
    }
  }

  pub fn set_iterations(&mut self, iterations: usize) {
    self.iterations = iterations;
  }

  pub fn set_shuffle(&mut self, shuffle: bool) {
    self.shuffle = shuffle;
  }

  pub fn add_point(&mut self, x: f32, y: f32, locked: bool) -> usize {
    self.points.push(Vector { x, y });
    self.old_pos.push(Vector { x, y });
    self.locked.push(locked);
    self.points.len() - 1
  }

  pub fn connect_points(&mut self, a: usize, b: usize) {
    // First, create the stick
    let pa = &self.points[a];
    let pb = &self.points[b];
    let size = (pa - pb).magnitude();
    let stick = Stick { a, b };
    // add it to the vector
    self.sticks.push(stick);
    self.sizes.push(size);
  }

  pub fn update_points(&mut self, dt: f32) {
    let gravity = Vector { x: 0.0, y: 1.0 };
    for i in 0..self.points.len() {
      if self.locked[i] {
        continue;
      }
      let pos = self.points[i].clone();
      self.points[i] += pos - self.old_pos[i] - gravity * dt;
      self.old_pos[i] = pos;
    }
  }

  pub fn fabrik_adjust(&mut self) {
    if self.shuffle {
      self.sticks.shuffle(&mut thread_rng());
    }

    for _ in 0..self.iterations {
      for i in 0..self.sticks.len() {
        let stick = &self.sticks[i];
        let len = &self.sizes[i];

        let dir = (self.points[stick.b] - self.points[stick.a]).normalized();
        let center = (self.points[stick.a] + self.points[stick.b]) / 2.0;

        if !self.locked[stick.a] {
          self.points[stick.a] = center - dir * (len / 2.0);
        }
        if !self.locked[stick.b] {
          self.points[stick.b] = center + dir * (len / 2.0);
        }
      }
    }
  }

  pub fn points(&self) -> *const Vector {
    self.points.as_ptr()
  }

  pub fn points_len(&self) -> usize {
    self.points.len()
  }

  pub fn sticks(&self) -> *const Stick {
    self.sticks.as_ptr()
  }

  pub fn sticks_len(&self) -> usize {
    self.sticks.len()
  }
}
