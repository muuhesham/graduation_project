import asyncHandler from "../middlewares/asyncWrapper.js";
import categoryService from "../services/categoryService.js";
import { sendSuccess } from "../utils/response.js";

const categoryController = {
    getAllCategories: asyncHandler(async (req, res) => {
       const categories = await categoryService.getAllCategories();
       sendSuccess(res, {categories}, 200); 
    }),
};

export default categoryController;