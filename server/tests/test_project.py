
import unittest
import os
import h5py
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
        saved_project = Project(test_file)

        # Create a simple mesh
        mesh = trimesh.creation.box()

        # Add the mesh to the project
        saved_project.add_mesh('box', mesh)

        # Save the project
        saved_project.save()

        # Verify the file was created
        self.assertTrue(os.path.exists(test_file))

        # Load the project
        loaded_project = Project(test_file)
        loaded_project.load()

        # Verify the mesh was loaded correctly
        self.assertIn('box', loaded_project.meshes)
        self.assertTrue(loaded_project.meshes['box'].is_volume)

    def test_load_nonexistent_file(self):
        # Attempt to load a nonexistent file

        project = Project('/does/not/exist.zinspector')

        with self.assertRaises(OSError):
            project.load()


if __name__ == '__main__':
    unittest.main()
