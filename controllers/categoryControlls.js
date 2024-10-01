const { CategoryModel } = require("../models/CategoryModel");
const slugify = require("slugify");



const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).send({ msg: "Name is required" });
    }
    const categoryExist = await CategoryModel.findOne({ name });
    if (categoryExist) {
      return res.status(400).send({ msg: `${name} already exist` });
    }
    // const slug =slugify(name)
    let category = await CategoryModel.create({ name:name.toLowerCase(), slug:slugify(name) });
    res.status(201).send({ msg: `${name} is created successfully`, category });
  } catch (error) {
      console.log(error);
    res.status(500).send({ msg: "error from Category create", error });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
      const id = req.params.id;
    if (!name) {
      return res.status(400).send({ msg: "Name is required" });
    }
    const categoryExist = await CategoryModel.findOne({ name });
    if (categoryExist) {
      return res.status(400).send({ msg: "Category name already exist" });
    }
    //   const slug = slugify(name)
    let updated = await CategoryModel.findByIdAndUpdate(id, { name, slug: slugify(name) }, {new:true});
    res.status(201).send({ msg: "Category updated successfully", updated });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "error from Category update", error });
  }
};
//==============================================
let deleteCategory = async (req, res) => {
  try {
    let id = req.params.id;
    let deleteItem = await CategoryModel.findByIdAndDelete(id);
    res.status(200).send({ msg: "Category deleted successfully" });
  } catch (error) {
    res.status(401).send({ msg: "error from delete Category", error });
  }
};
//======================================
const categoryList = async (req, res) => {
  try {
    const category = await CategoryModel.find({})
    if (!category || category?.length === 0) {
      return res.status(400).send("No data found");
    }
     let categoryList = category.sort((a, b) => {
       a = a.name.toLowerCase();
       b = b.name.toLowerCase();
       return a > b ? 1 : -1;
     });
    res.status(200).send(categoryList);
  } catch (error) {
    res.status(401).json({ msg: "error from category List", error });
  }
};
//=======================================================
const singleCategory = async (req, res) => {
  try {
    const singleCategory = await CategoryModel.findOne({slug:req.params.slug});
    if (!categoryList) {
      return res.status(400).send("No data found");
    }
    res.status(200).send(singleCategory);
  } catch (error) {
    res.status(401).json({ msg: "error from singleCategory", error });
  }
};


module.exports = { createCategory, updateCategory, categoryList, singleCategory, deleteCategory };