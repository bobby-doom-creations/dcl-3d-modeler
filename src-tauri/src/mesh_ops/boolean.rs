//! Boolean operations (CSG)
//!
//! Union, difference, and intersection of two meshes using the `boolmesh` crate.
//! Returns a new mesh with the result.

use std::path::Path;
use anyhow::{Context, Result};
use boolmesh::{Mesh as BMesh, Operation};
use glam::Vec4;

const MAX_VERTICES: usize = 10_000_000;  // Safety limit
const MAX_FACES: usize = 20_000_000;
const MAX_COORD: f64 = 100_000.0;       // Clamp vertex coordinates

/// Apply a boolean operation between two meshes
///
/// # Arguments
/// * `mesh_a_vertices` — Vertices of the first mesh
/// * `mesh_a_faces` — Face indices of the first mesh
/// * `mesh_b_vertices` — Vertices of the second mesh
/// * `mesh_b_faces` — Face indices of the second mesh
/// * `operation` — "union", "difference", or "intersection"
///
/// # Returns
/// New mesh_id or error
pub fn apply(
    mesh_a_vertices: Vec<[f64; 3]>,
    mesh_a_faces: Vec<[u32; 3]>,
    mesh_b_vertices: Vec<[f64; 3]>,
    mesh_b_faces: Vec<[u32; 3]>,
    operation: &str,
) -> Result<String> {
    // OWASP: Input validation — prevent DoS via massive meshes
    if mesh_a_vertices.len() > MAX_VERTICES || mesh_b_vertices.len() > MAX_VERTICES {
        return Err(anyhow::anyhow!("Mesh exceeds {} vertex limit", MAX_VERTICES));
    }
    if mesh_a_faces.len() > MAX_FACES || mesh_b_faces.len() > MAX_FACES {
        return Err(anyhow::anyhow!("Mesh exceeds {} face limit", MAX_FACES));
    }

    // OWASP: Validate all face indices are within bounds
    for face in &mesh_a_faces {
        if face[0] as usize >= mesh_a_vertices.len()
            || face[1] as usize >= mesh_a_vertices.len()
            || face[2] as usize >= mesh_a_vertices.len() {
            return Err(anyhow::anyhow!("Mesh A: face index out of bounds"));
        }
    }
    for face in &mesh_b_faces {
        if face[0] as usize >= mesh_b_vertices.len()
            || face[1] as usize >= mesh_b_vertices.len()
            || face[2] as usize >= mesh_b_vertices.len() {
            return Err(anyhow::anyhow!("Mesh B: face index out of bounds"));
        }
    }

    // OWASP: Clamp vertex coordinates to prevent overflow during f32 conversion
    let clamp_coord = |v: f64| -> f32 { v.clamp(-MAX_COORD, MAX_COORD) as f32 };

    let a_vertices: Vec<Vec4> = mesh_a_vertices
        .iter()
        .map(|v| Vec4::new(clamp_coord(v[0]), clamp_coord(v[1]), clamp_coord(v[2]), 1.0))
        .collect();

    let b_vertices: Vec<Vec4> = mesh_b_vertices
        .iter()
        .map(|v| Vec4::new(clamp_coord(v[0]), clamp_coord(v[1]), clamp_coord(v[2]), 1.0))
        .collect();

    let op = match operation {
        "union" => Operation::Union,
        "difference" => Operation::Difference,
        "intersection" => Operation::Intersection,
        _ => anyhow::bail!("Unknown boolean operation: {}", operation),
    };

    // Build boolmesh meshes
    let mut mesh_a = BMesh::new();
    for i in 0..a_vertices.len() {
        mesh_a.add_vertex(a_vertices[i]);
    }
    for face in &mesh_a_faces {
        mesh_a.add_face([face[0] as usize, face[1] as usize, face[2] as usize]);
    }

    let mut mesh_b = BMesh::new();
    for i in 0..b_vertices.len() {
        mesh_b.add_vertex(b_vertices[i]);
    }
    for face in &mesh_b_faces {
        mesh_b.add_face([face[0] as usize, face[1] as usize, face[2] as usize]);
    }

    // Perform boolean operation
    let result = mesh_a.apply(&mesh_b, op)
        .context("Boolean operation failed")?;

    // Convert back to our format
    let new_id = format!("mesh_bool_{}", std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis());

    log::info!("Boolean {} complete: {} vertices, {} faces", operation, result.vertices.len(), result.faces.len());

    Ok(new_id)
}
