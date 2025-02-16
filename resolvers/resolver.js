const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");

const resolvers = {
  Query: {
    async login(_, { email, password }) {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error("Invalid credentials");
      return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    },
    async getAllEmployees() {
      return await Employee.find();
    },
    async getEmployeeById(_, { id }) {
      return await Employee.findById(id);
    },
    async getEmployeesByDesignationOrDept(_, { designation, department }) {
      return await Employee.find({ $or: [{ designation }, { department }] });
    }
  },
  Mutation: {
    async signup(_, { username, email, password }) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({ username, email, password: hashedPassword });
      return "User registered successfully";
    },
    async addEmployee(_, args) {
      return await Employee.create(args);
    },
    async updateEmployee(_, { id, ...updateData }) {
      return await Employee.findByIdAndUpdate(id, updateData, { new: true });
    },
    async deleteEmployee(_, { id }) {
      await Employee.findByIdAndDelete(id);
      return "Employee deleted successfully";
    }
  }
};

module.exports = resolvers;
