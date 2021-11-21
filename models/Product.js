// import important parts of sequelize library
const { Model, DataTypes } = require('sequelize');
// import our database connection from config.js
const sequelize = require('../config/connection');

// Initialize Product model (table) by extending off Sequelize's Model class
class Product extends Model {}

Product.init(
  {
    //Id column 
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    //Product_name column
    product_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //Price column 
    price: {
      type: DataTypes.DECIMAL, 
      allowNull: false,
      validate: {
        isDecimal: true
      }
    },
    //Stock column
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false, 
      defaultValue: 10,
      validate: {
        isNumeric: true
      }
    },
    //Category_id column
    category_id: {
      type: DataTypes.INTEGER,
      //References the category model's id 
      references: {
        model: 'category',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'product',
  }
);

module.exports = Product;