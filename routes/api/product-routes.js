const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  Product.findAll({
    include: [
      {
        model: Category,
        attributes: ['id', 'category_name']
      },
      {
        model: Tag,
        attributes: ['id', 'tag_name']
      }
    ]
  })
    .then(dbProdData => res.json(dbProdData))
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
  });
});

// get one product
router.get('/:id', (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  Product.findOne({
    where: {
      id: req.params.id
    },
    include: [
      {
        model: Category,
        attributes: ['id', 'category_name']
      },
      {
        model: Tag,
        attributes: ['id', 'tag_name']
      }
    ]
  })
    .then(dbProdData => {
      if (!dbProdData) {
        res.status(404).json({ message: 'No product found'}); 
        return; 
      }
      res.json(dbProdData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
  });
});

// create new product
router.post('/', (req, res) => {
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const prodTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(prodTagIdArr);
      }
      // if no product tags, provide good status code
      res.status(200).json(product);
    })
    .then((prodTagIds) => res.status(200).json(prodTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const prodTagIds = productTags.map(({ tag_id }) => tag_id);
      // create list of new tag_ids
      const newProdTags = req.body.tagIds
        .filter((tag_id) => !prodTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      
      const tagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both
      return Promise.all([
        ProductTag.destroy({ where: { id: tagsToRemove } }),
        ProductTag.bulkCreate(newProdTags),
      ]);
    })
    .then((updatedProdTags) => res.json(updatedProdTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value
  Product.destroy({
    where: {
        id: req.params.id
    }
  })
    .then(dbProdData => {
        if (!dbProdData) {
            res.status(404).json({ message: 'No product found with this id'});
            return;
        }
        res.json(dbProdData);
  })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
  });
});

module.exports = router;
