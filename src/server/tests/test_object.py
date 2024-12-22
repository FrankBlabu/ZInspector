import h5py
import unittest

from elements.object import Object, ObjectIdDatabase

class MockObject (Object):

    def __init__(self, name):
        super ().__init__(name)

    def __load__(self, parent: h5py.Group):
        super ().__load__(parent)

    def __save__(self, parent: h5py.Group):
        super ().__save__(parent)



class TestObjectIdDatabase(unittest.TestCase):

    def setUp(self):
        self.db = ObjectIdDatabase()

    def test_add_and_get_object(self):
        obj = MockObject('test')
        obj_id = obj.get_id()
        retrieved_obj = self.db.get(obj_id)
        self.assertEqual(obj, retrieved_obj)
        self.assertEqual(obj.name, 'test')

    def test_remove_object(self):
        obj = MockObject('test')
        obj_id = obj.get_id()
        self.db.remove(obj_id)
        with self.assertRaises(KeyError):
            self.db.get(obj_id)

    def test_list_objects(self):
        obj1 = MockObject('test 1')
        obj2 = MockObject('test 2')
        objects = self.db.list_objects()
        self.assertIn(obj1.get_id(), objects)
        self.assertIn(obj2.get_id(), objects)
        self.assertEqual(objects[obj1.get_id()].name, 'test 1')
        self.assertEqual(objects[obj2.get_id()].name, 'test 2')

    def test_garbage_collected_object(self):
        obj = MockObject('test')
        obj_id = obj.get_id()
        del obj  # Force garbage collection
        with self.assertRaises(KeyError):
            self.db.get(obj_id)


class TestObject(unittest.TestCase):

    def test_object_creation(self):
        obj = MockObject('test')
        self.assertIsNotNone(obj.get_id())
        self.assertEqual(obj.name, 'test')

    def test_object_destruction(self):
        obj = MockObject('test')
        obj_id = obj.get_id()
        db = ObjectIdDatabase()
        self.assertIn(obj_id, db.list_objects())
        self.assertEqual(db.get(obj_id).name, 'test')
        del obj  # Force garbage collection
        with self.assertRaises(KeyError):
            db.get(obj_id)


if __name__ == '__main__':
    unittest.main()
