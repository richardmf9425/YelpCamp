var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");


//INDEX -- show all campgrounds
router.get("/", function (req, res) {
  // Get all campgrounds from db
  Campground.find({}, function (err, allCampgrounds) {
    if (err) {
      console.log(err);
    } else {
      res.render("campgrounds/index", {
        campgrounds: allCampgrounds,
        page: 'campgrounds'
      });
    }
  });

  // res.render("campgrounds", {
  //     campgrounds: campgrounds
  // });
});
//CREATE-- add a new campground to db
router.post("/", middleware.isLoggedIn, function (req, res) {
  var name = req.body.name;
  var price = req.body.price;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  }
  var newCampground = {
    name: name,
    price: price,
    image: image,
    description: desc,
    author: author
  };
  //Create a new campground and save to db
  Campground.create(newCampground, function (err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      //redirect back to campground page
      req.flash("success", "Successfully Created Campground");
      res.redirect("/campgrounds");
    }
  });
});
//NEW -- Show form to create new campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
  res.render("campgrounds/new");
});

//SHOW --shows more info about one campground
router.get("/:id", function (req, res) {
  //find the campground with provided ID
  Campground.findById(req.params.id)
    .populate("comments")
    .exec(function (err, foundCampground) {
      if (err || !foundCampground) {
        console.log(err);
        req.flash("error", "Campground not found");
        res.redirect("back")
;      } else {
        //render show template with that campground
        res.render("campgrounds/show", {
          campground: foundCampground
        });
      }
    });
});

//EDIT campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {
  Campground.findById(req.params.id, function (err, foundCampground) {
    res.render("campgrounds/edit", {
      campground: foundCampground
    });
  });
});




//UPDATE campground route
router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
  //find and update the correct campground
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
    if (err) {
      res.redirect("/campgrounds");
    } else {
      //redirect somewhere(show page)
      res.redirect("/campgrounds/" + req.params.id);
    }
  });

});

//DESTROY campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
  Campground.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      res.redirect("/campgrounds");
    } else {
      req.flash("success", "Successfully Deleted Campground");
      res.redirect("/campgrounds");
    }
  });
});


module.exports = router;