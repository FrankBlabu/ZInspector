
import unittest
import os
import shutil
import tempfile
import trimesh

from server.src.project import Project


class TestProject(unittest.TestCase):

    def setUp(self):

        # Create a temporary directory for writing/reading the test data
        self.dir = tempfile.mkdtemp()

    def tearDown(self):
        # Remove the temporary directory
        shutil.rmtree(self.dir)

    def test_add_and_save_mesh(self):

        test_file = self.dir + '/test.zinspector'
        saved_project = Project()

        # Create a simple mesh
        mesh = trimesh.creation.box()

        n_vertices = len(mesh.vertices)
        n_faces = len(mesh.faces)
        n_edges = len(mesh.edges)
        n_normals = len(mesh.face_normals)

        self.assertGreater(n_vertices, 0)
        self.assertGreater(n_faces, 0)
        self.assertGreater(n_edges, 0)
        self.assertGreater(n_normals, 0)

        # Add the mesh to the project
        saved_project.add_mesh('box', mesh)

        # Save the project
        saved_project.save(test_file)

        # Verify the file was created
        self.assertTrue(os.path.exists(test_file))

        # Load the project
        loaded_project = Project()
        loaded_project.load(test_file)

        # Verify the mesh was loaded correctly
        self.assertIn('box', loaded_project.meshes)

        loaded_mesh = loaded_project.get_mesh('box')

        self.assertTrue(loaded_mesh.is_volume)
        self.assertEqual(n_vertices, len(loaded_mesh.vertices))
        self.assertEqual(n_faces, len(loaded_mesh.faces))
        self.assertEqual(n_edges, len(loaded_mesh.edges))
        self.assertEqual(n_normals, len(loaded_mesh.face_normals))

    def test_load_nonexistent_file(self):
        # Attempt to load a nonexistent file

        project = Project()

        with self.assertRaises(OSError):
            project.load('/does/not/exist.zinspector')


if __name__ == '__main__':
    unittest.main()
