import unittest
from server.src.object import Object, ObjectIdDatabase


class TestObjectIdDatabase(unittest.TestCase):

    def setUp(self):
        self.db = ObjectIdDatabase()

    def test_add_and_get_object(self):
        obj = Object()
        obj_id = obj.get_id()
        retrieved_obj = self.db.get(obj_id)
        self.assertEqual(obj, retrieved_obj)

    def test_remove_object(self):
        obj = Object()
        obj_id = obj.get_id()
        self.db.remove(obj_id)
        with self.assertRaises(KeyError):
            self.db.get(obj_id)

    def test_list_objects(self):
        obj1 = Object()
        obj2 = Object()
        objects = self.db.list_objects()
        self.assertIn(obj1.get_id(), objects)
        self.assertIn(obj2.get_id(), objects)

    def test_garbage_collected_object(self):
        obj = Object()
        obj_id = obj.get_id()
        del obj  # Force garbage collection
        with self.assertRaises(KeyError):
            self.db.get(obj_id)


class TestObject(unittest.TestCase):

    def test_object_creation(self):
        obj = Object()
        self.assertIsNotNone(obj.get_id())

    def test_object_destruction(self):
        obj = Object()
        obj_id = obj.get_id()
        db = ObjectIdDatabase()
        self.assertIn(obj_id, db.list_objects())
        del obj  # Force garbage collection
        with self.assertRaises(KeyError):
            db.get(obj_id)


if __name__ == '__main__':
    unittest.main()
