import asyncHandler from "../middlewares/asyncWrapper.js";
import categoryService from "../services/categoryService.js";
import { sendSuccess } from "../utils/response.js";
import CategoryResource from "../resources/CategoryResource.js";

const categoryController = {
    getAllCategories: asyncHandler(async (req, res) => {
       const categories = await categoryService.list({ orderBy: { name: 'asc' } });
       sendSuccess(res, {categories: CategoryResource.collection(categories)}, 200); 
    }),
};

export default categoryController;