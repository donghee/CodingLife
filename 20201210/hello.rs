// comment!
struct Person {
    name: String,
    age: u8,
}

struct Unit;

struct Pair(i32, f32);

struct Point {
    x: f32,
    y: f32,
}

struct Rectangle {
    top_left: Point,
    bottom_right: Point,
}

fn main() {
    println!("Hello World!");
    let logical: bool = true;

    let a_float: f64 = 1.0; // Regular type anontation
    let an_integer = 5i32; // Suffix annotation

    let default_float = 3.0; // f64
    let default_integer = 7;

    let mut inferred_type = 12;
    inferred_type = 4294967296i64;

    let mut mutable = 12;
    mutable = 21;

    // mutable = true;
    let mutable = true;

    let pair = Pair(1, 0.1);
    println!("pair contains {:?} and {:?}", pair.0, pair.1);

}
