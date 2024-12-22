import unittest
import tempfile
import shutil
import os
import h5py
import trimesh
import numpy as np

from elements.mesh import Mesh


class TestMesh(unittest.TestCase):

    def setUp(self):
        # Create a temporary directory for writing/reading the test data
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        # Remove the temporary directory
        shutil.rmtree(self.temp_dir)

    def test_save_and_load_mesh(self):
        # Create a simple mesh
        mesh_data = trimesh.creation.box()
        mesh = Mesh('test_mesh', mesh_data)

        # Save the mesh to a temporary file
        temp_file = os.path.join(self.temp_dir, 'test_mesh.h5')
        with h5py.File(temp_file, 'w') as f:
            mesh_group = f.create_group('mesh')
            mesh.__save__(mesh_group)

        # Load the mesh from the temporary file
        loaded_mesh = Mesh('loaded_mesh', None)
        with h5py.File(temp_file, 'r') as f:
            mesh_group = f['mesh']
            loaded_mesh.__load__(mesh_group)

        # Verify that the loaded mesh name matches the original mesh name
        self.assertEqual(mesh.name, loaded_mesh.name)

        # Verify that the loaded mesh data matches the original mesh data
        self.assertEqual(len(mesh.data.vertices), len(loaded_mesh.data.vertices))
        self.assertEqual(len(mesh.data.faces), len(loaded_mesh.data.faces))

        # Verify that the loaded mesh id is different from the original mesh id
        self.assertNotEqual(id(mesh), id(loaded_mesh))


if __name__ == '__main__':
    unittest.main()
