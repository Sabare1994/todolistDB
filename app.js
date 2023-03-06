//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://sabaremech:Sabare%402662@cluster0.f06y5gc.mongodb.net/todolistDB",{useNewUrlParser:true, useUnifiedTopology:true})

const itemsSchema ={
  name:{
    type:String,
    required:[true,"Please add the name"]
  }
}

const Item = mongoose.model("Item",itemsSchema);


const item1 = new Item({
  name:"Welcome!!!"
})
const item2 = new Item({
  name:"Hit the + button to add the new item"
})
const item3 = new Item({
  name:"Hit the - button to delete the item"
})

const defaultItems = [item1,item2,item3]

const listSchema = {
  name:String,
  items:[itemsSchema]
}

const List = mongoose.model("list",listSchema)




// This is used to display the items into the main page of the website.
// The condition is for if the array is empty the database additon will happen. this is used to eliminate the items replication.


app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved")
        }
      })
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }

  })

});


// This is used to create a new page from from home page. for example(localhost:3000/work). This is used to change from home page to mentioned pages

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({

          name:customListName,
          items: defaultItems
        })
      list.save();
      res.redirect("/"+customListName)
      }else{
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  })

})



// This is used to if new items added into the main web page, that items will moved to the database. 

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({

    name: itemName
  })
  if(listName === "Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName)

    })
  }



});


// This is used to delete the item from our database and reflect in that page itself. 


app.post("/delete",function(req,res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Succussfully saved datas in DB")
        res.redirect("/")
      }
    })
    }else{
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkedItemId}}},function(err,foundList){
        if(!err){
          res.redirect("/"+listName)
        }
      })
    }


})




app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
