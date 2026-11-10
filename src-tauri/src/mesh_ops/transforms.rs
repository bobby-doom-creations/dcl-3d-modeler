//! Transform operations: scale, translate, rotate
//!
//! Uses glam for SIMD-accelerated 4x4 matrix transforms applied to mesh vertex data.

use glam::{Mat4, Vec3};
use anyhow::Result;

/// Apply a scaling transform to mesh vertices
pub fn scale(mesh_vertices: &mut Vec<[f64; 3]>, factor: &[f64]) -> Result<()> {
    let scale = Vec3::new(factor[0] as f32, factor[1] as f32, factor[2] as f32);
    let transform = Mat4::from_scale(scale);

    for v in mesh_vertices.iter_mut() {
        let vec = Vec3::new(v[0] as f32, v[1] as f32, v[2] as f32);
        let result = transform.transform_point3(vec);
        v[0] = result.x as f64;
        v[1] = result.y as f64;
        v[2] = result.z as f64;
    }

    Ok(())
}

/// Apply a translation transform to mesh vertices
pub fn translate(mesh_vertices: &mut Vec<[f64; 3]>, offset: &[f64]) -> Result<()> {
    let offset = Vec3::new(offset[0] as f32, offset[1] as f32, offset[2] as f32);

    for v in mesh_vertices.iter_mut() {
        let vec = Vec3::new(v[0] as f32, v[1] as f32, v[2] as f32);
        let result = vec + offset;
        v[0] = result.x as f64;
        v[1] = result.y as f64;
        v[2] = result.z as f64;
    }

    Ok(())
}

/// Apply a rotation transform to mesh vertices
/// Rotates around the X, Y, or Z axis by the provided angles in radians
pub fn rotate(mesh_vertices: &mut Vec<[f64; 3]>, angles: &[f64]) -> Result<()> {
    let rx = angles[0] as f32;
    let ry = angles[1] as f32;
    let rz = angles[2] as f32;

    // Build combined rotation matrix (Z → Y → X order)
    let sin_x = rx.sin();
    let cos_x = rx.cos();
    let sin_y = ry.sin();
    let cos_y = ry.cos();
    let sin_z = rz.sin();
    let cos_z = rz.cos();

    let rotation = Mat4::from_cols(
        glam::Vec4::new(cos_y * cos_z + sin_x * sin_y * sin_z, cos_z * sin_x * sin_y - cos_y * sin_z, cos_x * sin_y, 0.0),
        glam::Vec4::new(cos_x * sin_z, cos_x * cos_z, -sin_x, 0.0),
        glam::Vec4::new(cos_y * sin_z - cos_z * sin_x * sin_y, sin_y * sin_z + cos_y * cos_z * sin_x, cos_x * cos_y, 0.0),
        glam::Vec4::new(0.0, 0.0, 0.0, 1.0),
    );

    for v in mesh_vertices.iter_mut() {
        let vec = Vec3::new(v[0] as f32, v[1] as f32, v[2] as f32);
        let result = rotation.transform_point3(vec);
        v[0] = result.x as f64;
        v[1] = result.y as f64;
        v[2] = result.z as f64;
    }

    Ok(())
}
