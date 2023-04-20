import "@babel/polyfill";
import dotenv, { config } from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import Shopify, { ApiVersion, DataType } from "@shopify/shopify-api";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';
import ns from 'node-schedule';
import bodyparser from 'koa-bodyparser';
import cors from '@koa/cors';
import getSymbolFromCurrency from 'currency-symbol-map';
let requestip = require('request-ip');
let nodesendgrid = require('nodemailer-sendgrid');
let fs = require('fs');

MongoClient.connect("mongodb+srv://faizanj5070:SherlockH.1@purchasepal.aghlxby.mongodb.net/?retryWrites=true&w=majority", (err, db) => {
  dotenv.config();
  const port = parseInt(process.env.PORT, 10) || 8081;
  const dev = process.env.NODE_ENV !== "production";

  const app = next({
    dev,
  });

  const handle = app.getRequestHandler();



  var accessTokenExport;
  var client;
  // New Function //
  function exportAccessToken(accessToken) {
    console.log("function is called and Token Assigned To AccessTokenVariable.")
    accessTokenExport = accessToken;
    client = new Shopify.Clients.Rest("jztech-dev-store.myshopify.com", accessTokenExport);
  }



  Shopify.Context.initialize({
    API_KEY: process.env.SHOPIFY_API_KEY,
    API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
    SCOPES: process.env.SCOPES.split(","),
    HOST_NAME: process.env.HOST.replace(/https:\/\/|\/$/g, ""),
    API_VERSION: ApiVersion.October20,
    IS_EMBEDDED_APP: true,
    // This should be replaced with your preferred storage strategy
    SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
  });


  let mo_db = db.db("reminder_hero");
  let subscription_col = mo_db.collection('subscription');
  let session_col = mo_db.collection('viewsessions');
  let coupon_col = mo_db.collection('couponcode');

  let mailer = nodemailer.createTransport(nodesendgrid({
    apiKey: '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'
  }))
  // Storing the currently active shops in memory will force them to re-login when your server restarts. You should
  // persist this object in your app.
  const ACTIVE_SHOPIFY_SHOPS = {};
  app.prepare().then(async () => {
    const server = new Koa();
    const router = new Router();
    server.use(cors())


    server.keys = [Shopify.Context.API_SECRET_KEY];
    server.use(
      createShopifyAuth({
        async afterAuth(ctx) {
          // Access token and shop available in ctx.state.shopify
          const { shop, accessToken, scope } = ctx.state.shopify;
          ACTIVE_SHOPIFY_SHOPS[shop] = scope;

          console.log("Exporting AccessToken....")
          exportAccessToken(accessToken)
          console.log("Exported.")

          if (ctx.query.host) {
            server.context.hostVal = ctx.query.host;
          }

          const response = await Shopify.Webhooks.Registry.register({
            shop,
            accessToken,
            path: "/webhooks",
            topic: "APP_UNINSTALLED",
            webhookHandler: async (topic, shop, body) =>
              delete ACTIVE_SHOPIFY_SHOPS[shop],
          });

          if (!response.success) {
            console.log(
              `Failed to register APP_UNINSTALLED webhook: ${response.result}`
            );
          }

          if (response.success) {
            let getshopsubsdetails = await subscription_col.findOne({ shop: shop });
            server.context.planName = getshopsubsdetails.plan_name;

            if (getshopsubsdetails.is_selected_a_plan) {
              // check if the shop is using coupon code
              let pnid = getshopsubsdetails.user_plan_id || 1;
              let plan_name = pnid == 1 ? "STARTER" : pnid == 2 ? "PRO" : "PREMIUM";
              let plan_price = pnid == 1 ? 9.99 : pnid == 2 ? 24.99 : 59
              let plan_policy = pnid == 1 ? 100 : pnid == 2 ? 500 : "Unlimited";
              let returnurl = process.env.HOST + '/checksubscription?shop=' + shop + '&plan_id=' + pnid;
              
              if (getshopsubsdetails.coupon_used !== "") {
                // check if the coupon code is valid in coupon collection
                let coupon_detail = await coupon_col.findOne({ coupon_code: getshopsubsdetails.coupon_used });
                if (coupon_detail) {
                  // apply the discount on plan price with percentage
                  let discount_percentage = coupon_detail.percentoff;
                  let discount_amount = plan_price * discount_percentage / 100;
                  plan_price = plan_price - discount_amount;
                }
              }

              let plan1 = await client.post({
                path: 'recurring_application_charges',
                data: {
                  "recurring_application_charge": {
                    "name": plan_name,
                    "price": plan_price,
                    "return_url": returnurl,
                    "terms": `$${plan_price} for upto ${plan_policy} notification per month,50k sessions per month`,
                    "test": true
                  }
                },
                type: DataType.JSON,
              });

              if (await subscription_col.find({ shop: shop }).count() < 1) {
                await subscription_col.insertOne({ shop: shop, is_active: false })
              }

              // Redirect to app with shop parameter upon auth
              ctx.redirect(plan1.body.recurring_application_charge.confirmation_url);
            } else {
              ctx.redirect(`/?shop=${shop}&host=${ctx.hostVal}`);
            }
          }
        },
      })
    );

    const handleRequest = async (ctx) => {
      await handle(ctx.req, ctx.res);
      ctx.respond = false;
      ctx.res.statusCode = 200;
    };

    // APIS
    server.use(bodyparser());

    createShopifyAuth({
      async afterAuth(ctx) {
        // Access token and shop available in ctx.state.shopify
        const { shop, accessToken, scope } = ctx.state.shopify;
        const host = ctx.query.host;
        ACTIVE_SHOPIFY_SHOPS[shop] = scope;
      }
    })

    router.use(async (ctx, next) => {
      let userip = requestip.getClientIp(ctx.req);
      switch (ctx.planName) {
        case "STARTER":
        case "PRO":
          let session = await session_col.find({ ip: userip, shop: process.env.SHOP, is_expired: false }).count();
          if (session < 1) {
            await session_col.insertOne({ ip: userip, shop: process.env.SHOP, session_start: new Date(), session_end: null, is_expired: false }, (err, res) => {
              if (err) {
                console.log(err)
              }
              // decrement the session_remaining in subscription collection

              subscription_col.updateOne({ shop: process.env.SHOP }, { $inc: { sessions_remaining: -1 } },{upsert:true})
              ns.scheduleJob(new Date(Date.now() + 120000), async () => {
                await session_col.updateOne({ _id: res.insertedId }, { $set: { is_expired: true, session_end: new Date() } },{upsert:true})
              })
            })
          }
      }
      await next()
    })

    router.use(async (ctx, next) => {
      let subscription = await subscription_col.findOne({ shop: process.env.SHOP });
      // check if expiring_date is less than today
      let exp_date = new Date(subscription.expiring_date);
      if (exp_date < new Date()) {
        await subscription_col.updateOne({ shop: process.env.SHOP }, { $set: { is_active: false, email_remaining: 0, sessions_remaining: 0 } })
      }
      await next()
    })

    router.use(async (ctx, next) => {

      const startTime = new Date()
      await next()
      const timeDelta = new Date() - startTime
      console.log(ctx.request.path, timeDelta, ctx.response.status)
    })


    let remind_col = mo_db.collection("reminders");
    let config_col = mo_db.collection("cofiguration");
    let product_col = mo_db.collection("products");


    router.get("/checksubscription", async (ctx) => {
      let shop = ctx.query.shop;
      let plan = await client.get({
        path: 'recurring_application_charges/' + ctx.query.charge_id,
      })

      let emails = plan.body.recurring_application_charge.name == "STARTER" ? 100 : plan.body.recurring_application_charge.name == "PRO" ? 500 : "Unlimited";
      let sessions = plan.body.recurring_application_charge.name == "STARTER" ? 10000 : plan.body.recurring_application_charge.name == "PRO" ? 50000 : "Unlimited";
      let date = new Date();
      let end_date = new Date(date.setMonth(date.getMonth() + 1));

      if (plan.body.recurring_application_charge.status == "active") {

        await subscription_col.updateOne({ shop: shop }, { $set: { started_date: date, expiring_date: end_date, plan_id: plan.body.recurring_application_charge.id, plan_name: plan.body.recurring_application_charge.name, is_active: true, email_remaining: emails, sessions_remaining: sessions, is_selected_a_plan: false } },{upsert:true})

        // getting Shop Email
        let shop_email = await client.get({
          path: 'shop',
        })

        mailer.sendMail({
          from: "hello@treaclejar.com",
          to: shop_email.body.shop.email || "hasnainmirza88@gmail.com",
          subject: "Welcome To Reminder Hero",
          html: `Hey ${shop_email.body.shop.name},<br>

          Welcome to Reminder Hero. thank you for signing up to our service.
                    
          we’d love to hear what you think of Reminder Hero and if there is anything we can improve. If you have any questions, please reply to this email. we are always happy to help!
      
          Thanks`
        })


        let script_tags_count = await client.get({ path: "script_tags" })
        if (script_tags_count.body.script_tags.length < 1 && !script_tags_count.body.script_tags.find(x => x.src.includes("/script-tag.js"))) {
          await client.post({
            path: 'script_tags',
            data: { "script_tag": { "event": "onload", "src": `${process.env.HOST}/script-tag.js` } },
            type: DataType.JSON,
          });
        }

        ctx.redirect(`/?shop=${shop}&host=${ctx.hostVal}`);
      } else {
        await subscription_col.updateOne({ shop: shop }, { $set: { is_selected_a_plan: false,coupon_used:"" } },{upsert:true})
        ctx.body = "Plan Not Activated Yet";
      }
    })

    router.get("/getrevenue", async (ctx) => {
      // get all products and sum the price
      let products = await client.get({
        path: 'products',
      })
      let total_revenue = 0;
      products.body.products.forEach(product => {
        total_revenue += parseFloat(product.variants[0].price);
      })
      let product_query = `query{
        products(first:1){
          nodes{
              variants(first:1){
                nodes{
                  presentmentPrices(first:1){
                    nodes{
                      price{
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          }
      }`;
        await fetch(`https://${process.env.SHOP}/admin/api/2022-04/graphql.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessTokenExport
          },
          body: JSON.stringify({ query: product_query })
        }).then(res => res.json().then( async currcode =>{ 
          total_revenue = getSymbolFromCurrency(currcode.data.products.nodes[0].variants.nodes[0].presentmentPrices.nodes[0].price.currencyCode)+" "+total_revenue;
        }));
      ctx.body = total_revenue;
    })

    // Reminders Funtionalitiese
    router.get("/remindersbyproducts", async (ctx) => {
      let limit = 10
      let page = ctx.query.page;
      let skipno = page <= 1 ? 0 : ((page - 1) * limit)+1;
      ctx.both = await remind_col.aggregate([{ $match: { shop: process.env.SHOP } }, { $group: { _id: "$product_id", rcount: { $count: {} } } }, { $sort: { "rcount": -1 } }]).toArray();
      let totalproductcount = await remind_col.aggregate([{ $match: { shop: process.env.SHOP } }, { $group: { _id: "$product_id" } }]).toArray();
      ctx.product = [[], [totalproductcount.length]];
// ---------------------------------------------------------------------
      // get all products from shopify with product id
      // let products = await client.get({
      //   path: 'products'
      // })

      // ctx.both.forEach(async (product)=>{
      //   let product_id = product._id;
      //   products.body.products.forEach(async (shopiproduct)=>{
      //     if(shopiproduct.id == product_id){
      //       let product_image = shopiproduct.image.src;
      //       let product_name =  shopiproduct.title;
      //       let product_inventory = shopiproduct.variants[0].inventory_management ? shopiproduct.variants[0].inventory_quantity : "Not Tracked";
      //       let product_price = shopiproduct.variants[0].price;
      //       let product_reminders = await remind_col.find({product_id:product_id}).count()
      //       let product_pending = await remind_col.find({"product_id":product_id,"is_reminded":"false"}).count()
      //       let product_sent = await remind_col.find({"product_id":product_id,"is_reminded":"true"}).count()
      //       let product_last = await remind_col.aggregate([{$match:{product_id:product_id}},{$group:{_id:null,last_reminded:{"$max":"$reminded_date"}}}]).toArray()
            
      //       ctx.product[0].push([product_image,product_name,product_inventory,product_price,product_reminders,product_pending,product_sent,product_last[0].last_reminded])
      //     }
      //   })
      // })
// ---------------------------------------------------------------------
      // for (let i = 0; i < ctx.both.length; i++) {
      //   let product_id = ctx.both[i]._id;
      //   let product_query = `query{product(id:"gid://shopify/Product/${product_id}"){
      //     title
      //     tracksInventory
      //     totalInventory
      //     images(first:1) {
      //       nodes{
      //         url
      //       }
      //     }
      //     variants(first:1){
      //       nodes{
      //         price
      //         presentmentPrices(first:1){
      //           nodes{
      //             price{
      //               currencyCode
      //             }
      //           }
      //         }
      //       }
      //     }
      //     id
      //   }}`;
      //   await fetch(`https://${process.env.SHOP}/admin/api/2022-04/graphql.json`, {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       "X-Shopify-Access-Token": accessTokenExport
      //     },
      //     body: JSON.stringify({ query: product_query })
      //   }).then(res => res.json().then( async data =>{ 
      //     console.log(data.data)
      //     // let productd = await client.get({ path: "products/" + ctx.both[i]._id });
      //     let productd = data.data.product;
      //     if (await remind_col.find({ product_id: product_id }).count() > 0) {
      //       let last_remind = await remind_col.aggregate([{ $match: { product_id: product_id } }, { $group: { _id: null, last_reminded: { "$max": "$reminded_date" } } }]).toArray()
      //       ctx.product[0].push([productd.images.nodes[0].url, productd.title, productd.tracksInventory ? productd.totalInventory : "Not Tracked", getSymbolFromCurrency(productd.variants.nodes[0].presentmentPrices.nodes[0].price.currencyCode)+" "+productd.variants.nodes[0].price, await remind_col.find({ product_id: product_id }).count(), await remind_col.find({ "product_id": product_id, "is_reminded": "false" }).count(), await remind_col.find({ "product_id": product_id, "is_reminded": "true" }).count(), product_id, last_remind[0].last_reminded])
      //     }
      //   }));
      // }
// ---------------------------------------------------------------------
      // get all reminders from db with product collection(foreign key is product_id)
      let reminders = await remind_col.aggregate([
        {
            '$match': {
                'shop': 'jztech-dev-store.myshopify.com'
            }
        }, {
          '$group': {
            '_id': '$product_id', 
            'sentcount': {
              '$sum': {
                '$cond': [
                  {
                    '$eq': [
                      '$is_reminded', 'true'
                    ]
                  }, 1, 0
                ]
              }
            }, 
            'pendcount': {
              '$sum': {
                '$cond': [
                  {
                    '$eq': [
                      '$is_reminded', 'false'
                    ]
                  }, 1, 0
                ]
              }
            },
            'rcount': {
              '$sum': 1
            },
            'last': {
              '$max': '$reminded_date'
            }
          }
        }, {
            '$lookup': {
                'from': 'products', 
                'localField': '_id', 
                'foreignField': 'product_id', 
                'as': 'product_info'
            }
        },
        {
        '$sort': {
            'rcount': -1
        }
      }
    ]).toArray();

      for(let i = 0; i < reminders.length; i++){
        let reminder = reminders[i];
        let product_id = reminder._id;
        let product_image = reminder.product_info[0].image;
        let product_title = reminder.product_info[0].title;
        let product_price = getSymbolFromCurrency(reminder.product_info[0].currency_code)+" "+reminder.product_info[0].price;
        let product_inventory = reminder.product_info[0].is_track_inventory ? reminder.product_info[0].inventory : "Not Tracked";
        // let product_reminders = await remind_col.find({shop:process.env.SHOP,product_id:product_id}).count()
        // let product_pending = await remind_col.find({shop:process.env.SHOP,product_id:product_id,is_reminded:"false"}).count()
        // let product_sent = await remind_col.find({shop:process.env.SHOP,product_id:product_id,is_reminded:"true"}).count()
        // let product_last = await remind_col.aggregate([{$match:{shop:process.env.SHOP,product_id:product_id}},{$group:{_id:null,last_reminded:{"$max":"$reminded_date"}}}]).toArray()
        let product_reminders = reminder.rcount;
        let product_pending = reminder.pendcount;
        let product_sent = reminder.sentcount;
        let product_last = reminder.last ?`${new Date(reminder.last).getMonth()+1}-${new Date(reminder.last).getDate()}-${new Date(reminder.last).getFullYear()}` : "In Pending";
        ctx.product[0].push([product_image,product_title,product_inventory,product_price,product_reminders,product_pending,product_sent,product_id,product_last,])
      }
      

      ctx.body = ctx.product;
    })

    router.post("/productbyid", async (ctx) => {
      ctx.sigprod = await client.get({ path: "products/" + ctx.request.body.pid });
      let dcre = await remind_col.find({shop:process.env.SHOP, product_id: ctx.sigprod.body.product.id }).sort({ added_date: -1 }).limit(1).toArray()
      let lmind = await remind_col.find({shop:process.env.SHOP, product_id: ctx.sigprod.body.product.id }).sort({ reminded_date: 1 }).limit(1).toArray()
      ctx.body = [
        ctx.sigprod.body.product.image.src,
        ctx.sigprod.body.product.title,
        ctx.sigprod.body.product.variants[0].inventory_management ? ctx.sigprod.body.product.variants[0].inventory_quantity : "Not Tracked",
        ctx.sigprod.body.product.variants[0].price,
        await remind_col.find({shop:process.env.SHOP, product_id: ctx.sigprod.body.product.id }).count(),
        await remind_col.find({shop:process.env.SHOP, product_id: ctx.sigprod.body.product.id, "is_reminded": "false" }).count(),
        await remind_col.find({shop:process.env.SHOP, product_id: ctx.sigprod.body.product.id, "is_reminded": "true" }).count(),
        dcre[0].added_date,
        lmind[0].reminded_date,
        ctx.sigprod.body.product.body_html
      ]

    })

    router.get("/remindersbyproductstest", async (ctx) => {
      ctx.both = await client.get({ path: "products" });
      ctx.producttes = [];
      for (let i = 0; i < ctx.both.body.products.length; i++) {
        if (await remind_col.find({ product_id: ctx.both.body.products[i].id }).count() > 0) {
          ctx.producttes.push([ctx.both.body.products[i].image.src, ctx.both.body.products[i].title, ctx.both.body.products[i].variants[0].inventory_quantity, ctx.both.body.products[i].variants[0].price, await remind_col.find({shop:process.env.SHOP, product_id: ctx.both.body.products[i].id }).count(), await remind_col.find({shop:process.env.SHOP, "product_id": ctx.both.body.products[i].id, "is_reminded": "false" }).count(), await remind_col.find({shop:process.env.SHOP, "product_id": ctx.both.body.products[i].id, "is_reminded": "true" }).count(), ctx.both.body.products[i].id])
        }
      }

      ctx.body = ctx.producttes;
    })

    router.get("/reminders", async (ctx) => {
      ctx.body = await remind_col.find({shop:process.env.SHOP}).toArray();
    });

    router.get("/reminders/sent", async (ctx) => {
      ctx.body = await remind_col.find({shop:process.env.SHOP, "is_reminded": "true" }).toArray() || [];
    })

    router.get("/reminders/pending", async (ctx) => {
      ctx.body = await remind_col.find({shop:process.env.SHOP, "is_reminded": "false" }).toArray();
    })

    router.get("/reminders/getgraphdatabyday", async (ctx) => {
      // find distinct days and count the number of reminders
      // let days = await remind_col.distinct("remind_date");
      // let data = [];
      // for(let i=0;i<days.length;i++){
      //   let count = await remind_col.find({"remind_date":days[i]}).count();
      //   data.push(count);
      // }
      // ctx.body = data;
      ctx.body = [
        await remind_col.aggregate([{ $group: { _id: [{ $year: "$added_date" }, { $month: "$added_date" }, { $dayOfMonth: "$added_date" }], count: { $count: {} } } }, { $sort: { _id: 1 } }]).toArray(),
        await remind_col.aggregate([{ $match: { 'is_reminded': 'true' } }, { $group: { _id: [{ $year: "$remind_date" }, { $month: "$remind_date" }, { $dayOfMonth: "$remind_date" }], count: { $count: {} } } }, { $sort: { _id: 1 } }]).toArray(),
        await remind_col.aggregate([{ $match: { 'is_reminded': 'false' } },{ $group: { _id: [{ $year: "$remind_date" }, { $month: "$remind_date" }, { $dayOfMonth: "$remind_date" }], count: { $count: {} } } }, { $sort: { _id: 1 } }]).toArray()
      ];
    })

    router.get("/reminders/:matchingvalue", async (ctx) => {
      ctx.body = await remind_col.find({shop:process.env.SHOP, "_id": ctx.params.matchingvalue }).toArray();
    });

    router.post("/reminders", async (ctx) => {
      let added_date = new Date()
      let fname = ctx.request.body.fname;
      let lname = ctx.request.body.lname;
      let email = ctx.request.body.email.toLowerCase();
      let reminding_date = new Date(ctx.request.body.date_to_remind);
      let after_reminddate = new Date(reminding_date.setDate(reminding_date.getDate() + 1));
      let before_reminddate = new Date(reminding_date.setDate(reminding_date.getDate() - 1));
      let product_id = ctx.request.body.product_id;
      let shop_name = process.env.SHOP;

      // check if first name, last name, email, and product id are empty
      if (fname == "" || lname == "" || email == "" || product_id == "") {
        ctx.body = {
          "status": "error",
          "message": "Please fill out all fields"
        }
        ctx.status = 400;
      }
      
      let product_query = `query{product(id:"gid://shopify/Product/${product_id}"){
        id
        title
        tracksInventory
        totalInventory
        descriptionHtml
        images(first:1) {
          nodes{
            url
          }
        }
        variants(first:1){
          nodes{
            price
            presentmentPrices(first:1){
              nodes{
                price{
                  currencyCode
                }
              }
            }
          }
        }

      }}`;
      await fetch(`https://${process.env.SHOP}/admin/api/2022-04/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessTokenExport
        },
        body: JSON.stringify({ query: product_query })
      }).then(res => res.json().then( async data =>{ 
        console.log("=======================================================")
        console.log(data)
        console.log(data.data.product.title)
        console.log(data.data.product.descriptionHtml)
        console.log(data.data.product.images.nodes[0].url)
        console.log(data.data.product.variants.nodes[0].price)
        console.log(data.data.product.variants.nodes[0].presentmentPrices.nodes[0].price.currencyCode)
        console.log(data.data.product.totalInventory)
        console.log(data.data.product.tracksInventory)
        console.log("=======================================================")
        let product = data.data.product;

        let product_in_db = await product_col.find({shop:process.env.SHOP, "product_id": product_id }).toArray();
        if (product_in_db.length == 0) {
          await product_col.insertOne({
            "product_id": product_id,
            "title": product.title,
            "description": product.descriptionHtml,
            "image": product.images.nodes[0].url,
            "price": product.variants.nodes[0].price,
            "inventory": product.totalInventory,
            "is_track_inventory": product.tracksInventory,
            "currency_code": product.variants.nodes[0].presentmentPrices.nodes[0].price.currencyCode
          });
        }else {
          await product_col.updateOne({ "product_id": product_id }, {
            $set: {
              "title": product.title,
              "description": product.descriptionHtml,
              "image": product.images.nodes[0].url,
              "price": product.variants.nodes[0].price,
              "inventory": product.totalInventory,
              "is_track_inventory": product.tracksInventory,
              "currency_code": product.variants.nodes[0].presentmentPrices.nodes[0].price.currencyCode
            }
          },{upsert:true});
        }

      }));


      // let updated_products = await client.get({ path: "products" })

      // for (let i = 0; i < updated_products.body.products.length; i++) {
      //   let product = updated_products.body.products[i];
      //   let product_data = await product_col.findOne({ shopify_id: product.id });
      //   if (!product_data) {
      //     console.log("Inserted Product")
      //     product_col.insertOne({
      //       product_id: product.id,
      //       title: product.title,
      //       body_html: product.body_html,
      //       image: product.images[0].src,
      //       price: product.variants[0].price,
      //       currency_code: product.variants[0].presentment_prices[0].price.currency_code,
      //       inventory_quantity: product.variants[0].inventory_quantity,
      //       inventory_management: product.variants[0].inventory_management,
      //       shop: shop
      //     })
      //   }else{
      //     console.log("Updated Product")
      //     product_col.updateOne({ shopify_id: product.id }, {
      //       $set: {
      //         product_id: product.id,
      //         title: product.title,
      //         body_html: product.body_html,
      //         image: product.images[0].src,
      //         price: product.variants[0].price,
      //         currency_code: product.variants[0].presentment_prices[0].price.currency_code,
      //         inventory_quantity: product.variants[0].inventory_quantity,
      //         inventory_management: product.variants[0].inventory_management,
      //         shop: shop
      //       }
      //     })
      //   }
      // }
      let subs_detail = await subscription_col.findOne({ shop: shop_name });
      let logourl = await config_col.find({shop:process.env.SHOP, "key": "LOGOURL" }).toArray();


      if (subs_detail.is_active || subs_detail.email_remaining > 0) {
        let notifydaytemplate = await config_col.find({shop:process.env.SHOP, "key": "NOTIFYDAY" }).toArray();
        let beforenotifydaytemplate = await config_col.find({shop:process.env.SHOP, "key": "BEFORENOTIFYDAY" }).toArray();
        let afternotifydaytemplate = await config_col.find({shop:process.env.SHOP, "key": "AFTERNOTIFYDAY" }).toArray();
        let reminderconfi = await config_col.find({shop:process.env.SHOP, "key": "REMINDERCONFIRM" }).toArray();
        let notistock = await config_col.find({shop:process.env.SHOP, "key": "NOTISTOCKPROD" }).toArray();


        remind_col.insertOne({
          shop: shop_name,
          fname: fname,
          lname: lname,
          email: email.toLowerCase(),
          remind_date: reminding_date,
          product_id: product_id,
          added_date: added_date,
          is_reminded: "false",
          reminded_date: null,
        }, async (err, rlt) => {
          if (err) ctx.body = err;
          let prod = await client.get({ path: "products/" + product_id })
          let product_HTML = '<div style="display:flex;flex-wrap:wrap;width:100%;background: #F5F5F5;border-radius: 3px;"><div style="border-radius: 3px;display:flex;align-items:center;"><img src=' + prod.body.product.images[0].src + ' width="100px"/></div><div style="display: flex;flex-direction:column; justify-content: center; flex-grow: 1; padding: 0px 20px;"><a style="font-size:15px;padding:5px 0px;align-self:center;" href="https://' + shop_name + '/products/' + prod.body.product.title + '">' + prod.body.product.title + '</a><p style="align-self:center;">'+prod.body.product.body_html+'</p></div><div style="display:flex;font-size:15px;align-self:center;padding:0px 20px;border-left:1px solid #C7C5C5;">$ ' + prod.body.product.variants[0].price || prod.body.product.variants.price || 20000 + '</div></div>';

          // let product_query = `query{product(id:"gid://shopify/Product/${product_id}"){
          //   title
          //   tracksInventory
          //   totalInventory
          //   images(first:1) {
          //     nodes{
          //       url
          //     }
          //   }
          //   variants(first:1){
          //     nodes{
          //       price
          //       presentmentPrices(first:1){
          //         nodes{
          //           price{
          //             currencyCode
          //           }
          //         }
          //       }
          //     }
          //   }
          //   id
          // }}`;
          // await fetch(`https://${process.env.SHOP}/admin/api/2022-04/graphql.json`, {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json",
          //     "X-Shopify-Access-Token": accessTokenExport
          //   },
          //   body: JSON.stringify({ query: product_query })
          // }).then(res => res.json().then( async data =>{ 
          //   console.log(data.data)
          //   // let productd = await client.get({ path: "products/" + ctx.both[i]._id });
          //   let productd = data.data.product;
          //   if (await remind_col.find({ product_id: product_id }).count() > 0) {
          //     let last_remind = await remind_col.aggregate([{ $match: { product_id: product_id } }, { $group: { _id: null, last_reminded: { "$max": "$reminded_date" } } }]).toArray()
          //     ctx.product[0].push([productd.images.nodes[0].url, productd.title, productd.tracksInventory ? productd.totalInventory : "Not Tracked", getSymbolFromCurrency(productd.variants.nodes[0].presentmentPrices.nodes[0].price.currencyCode)+" "+productd.variants.nodes[0].price, await remind_col.find({ product_id: product_id }).count(), await remind_col.find({ "product_id": product_id, "is_reminded": "false" }).count(), await remind_col.find({ "product_id": product_id, "is_reminded": "true" }).count(), product_id, last_remind[0].last_reminded])
          //   }
          // }));
          
          function tempbodyvariables(template) {
            try {
              let ptitlefurl = prod.body.product.title.toString().toLowerCase().replaceAll(" ", "-");
              console.log(ptitlefurl)
              let produrl = `https://${shop_name}/products/${ptitlefurl}`;
              return template.toString().replaceAll("{firstname}", fname)
                .replaceAll("{lastname}", lname)
                .replaceAll("{email}", email.toLowerCase())
                .replaceAll("{reminddate}", `${reminding_date.getFullYear()}-${reminding_date.getMonth() + 1}-${reminding_date.getDate()}`)
                .replaceAll("{remindtime}", `${reminding_date.getHours()}:${reminding_date.getMinutes()}`)
                .replaceAll("{product.name}", prod.body.product.title)
                .replaceAll("{product.image}", `<img src="${prod.body.product.image.src}" />`)
                .replaceAll("{product.price}", prod.body.product.variants[0].price)
                .replaceAll("{product.url}", produrl)
                .replaceAll("{product.frame}", product_HTML)
            } catch (e) {
              console.log("Could not replace variables Maybe template is empty");
            }
          }

          // Email For Confirmation
          if (reminderconfi[0].value[0]) {
            mailer.sendMail({
              from: "reminderhero@treaclejar.com",
              to: email,
              subject: reminderconfi[0].value[1],
              html: `${tempbodyvariables(reminderconfi[0].value[2])}<br/><img src="cid:logo"/>`
            }, (err, result) => {
              if (err) console.log("Confirmation Email Error: ", err);
              else {
                ctx.planName !== "PREMIUM" ? subscription_col.updateOne({ shop: shop_name }, { $inc: { "email_remaining": -1 } },{upsert:true}) : null;
              }
            })
          }

          if (notifydaytemplate[0].value[0]) {
            console.log("[Yes] NOtify Day is True")
            if (notistock[0].value) {
              console.log("[Yes] Product Stock Setting is Turned ON")
              console.log("Variants-----")
              console.log("Also the Inventory is", prod.body.product.variants)
              console.log("Body-----")
              console.log("Also the Inventory is", prod.body)
              if (prod.body.product.variants[0].inventory_quantity > 1) {
                console.log("Porduct is in Stock")
                ns.scheduleJob(reminding_date, () => {
                  console.log("Scheduling Email...")
                  mailer.sendMail({
                    from: "reminderhero@treaclejar.com",
                    to: email,
                    subject: notifydaytemplate[0].value[1],
                    html: `${tempbodyvariables(notifydaytemplate[0].value[2])}<br/><img src="cid:logo"/>`,
                  }, (err, result) => {
                    if (err) console.log(err)
                    else {
                      console.log("yes Notify Day Email Sent")
                      remind_col.updateOne({ _id: rlt.insertedId }, { $set: { "is_reminded": "true", "reminded_date": new Date() } },{upsert:true});
                      // update remaining email by -1
                      ctx.planName !== "PREMIUM" ? subscription_col.updateOne({ shop: shop_name }, { $inc: { "email_remaining": -1 } },{upsert:true}) : null;
                    }
                  })
                })
              }
              console.log("Porduct is out of stock")
            } else {
              console.log("[Yes] Product Stock Setting is Turned OFF")
              ns.scheduleJob(reminding_date, () => {
                console.log("Scheduling Email...")

                mailer.sendMail({
                  from: "reminderhero@treaclejar.com",
                  to: email,
                  subject: notifydaytemplate[0].value[1],
                  html: `${tempbodyvariables(notifydaytemplate[0].value[2])}<br/><img src="cid:logo"/>`,
                }, (err, result) => {
                  if (err) console.log(err)
                  else {
                    console.log("Email Sent")

                    remind_col.updateOne({ _id: rlt.insertedId }, { $set: { "is_reminded": "true", "reminded_date": new Date() } },{upsert:true});
                    // update remaining email by -1
                    ctx.planName !== "PREMIUM" ? subscription_col.updateOne({ shop: shop_name }, { $inc: { "email_remaining": -1 } },{upsert:true}) : null;
                  }
                })
              })
            }
          }
          let bnday = beforenotifydaytemplate[0].value[0];

          if (bnday && prod.body.product.variants[0].inventory_quantity !== 0) {
            ns.scheduleJob(before_reminddate, () => {
              mailer.sendMail({
                from: "reminderhero@treaclejar.com",
                to: email,
                subject: beforenotifydaytemplate[0].value[1],
                html: `${tempbodyvariables(beforenotifydaytemplate[0].value[2])}<br/><img src="cid:logo"/>`,
              }, function (err, result) {
                if (err) console.log(err)
                ctx.planName !== "PREMIUM" ? subscription_col.updateOne({ shop: shop_name }, { $inc: { "email_remaining": -1 } },{upsert:true}) : null;
              })
            })
          }

          let anday = afternotifydaytemplate[0].value[0];
          if (anday) {
            ns.scheduleJob(after_reminddate, () => {
              mailer.sendMail({
                from: "reminderhero@treaclejar.com",
                to: email,
                subject: afternotifydaytemplate[0].value[1],
                html: `${tempbodyvariables(afternotifydaytemplate[0].value[2])}<br/><img src="cid:logo"/>`,
              }, function (err, result) {
                if (err) console.log(err)
                ctx.planName !== "PREMIUM" ? subscription_col.updateOne({ shop: shop_name }, { $inc: { "email_remaining": -1 } },{upsert:true}) : null;
              })
            })
          }

        })
        
        ctx.res.statusCode = 201;
      }
    })

    // Products
    router.get("/products", async (ctx) => {
      const session = await Shopify.Utils.loadCurrentSession(ctx.request, ctx.response, false);
      ctx.body = session;
    })

    // Configuration
    router.get("/configuration", async (ctx) => {
      console.log("Debugging")
      console.log(process.env.SHOP)
      ctx.body = await config_col.find({shop:process.env.SHOP}).toArray();
    })

    router.get("/configuration/emailtemplate", async (ctx) => {
      ctx.body = await config_col.find({shop:process.env.SHOP, "key": "EMAILTEMPLATE" }).toArray();
    })

    router.post("/configuration/emailtemplate", async (ctx) => {
      ctx.body = await config_col.updateOne({shop:process.env.SHOP, "key": "EMAILTEMPLATE" }, { $set: { "value": ctx.request.body.emailtemplate } },{upsert:true})
    })

    router.post("/configuration/updatebykey", async (ctx) => {
      console.log("Debugging")
      console.log(process.env.SHOP)
      ctx.body = await config_col.updateOne({shop:process.env.SHOP, "key": ctx.request.body.key }, { $set: { "value": ctx.request.body.value } },{upsert:true});
    })

    router.get("/configuration/getbykey/:keyid", async (ctx) => {
      ctx.body = await config_col.find({shop:process.env.SHOP, "key": ctx.params.keyid }).toArray();
    })

    router.put("/scripts-tag/modify", async (ctx) => {
      ctx.body = await client.put({
        path: `script_tags/${ctx.request.body.scriptid}`,
        data: { "script_tag": { "id": ctx.request.body.scriptid, "src": `${ctx.request.body.newpath}` } },
        type: DataType.JSON,
      })
    })

    // Get Customers

    router.get("/getcustomers", async (ctx) => {
      ctx.body = await remind_col.aggregate([{ $group: { _id: "$email", fname: { "$last": "$fname" }, lname: { "$last": "$lname" }, total_reminder: { $sum: 1 }, first_reminded: { $min: "$added_date" }, last_reminded: { $max: "$reminded_date" } } }, { $sort: { "total_reminder": -1 } }]).toArray();
    })

    router.get("/getnewreminders", async (ctx) => {
      let dd = new Date();
      let ee = new Date();
      dd.setDate(dd.getDate() - 7);
      dd.setHours(23, 59, 59, 999);
      ee.setHours(23, 59, 59, 999);

      ctx.body = await remind_col.find({shop:process.env.SHOP, added_date: { $gte: dd, $lte: ee } }).count();
    })

    router.post("/getcustomersbyproduct", async (ctx) => {
      let pid = parseInt(ctx.request.body.productid);
      console.log(pid)
      ctx.body = await remind_col.aggregate([
        {
          $match: {
            product_id: pid
          }
        }
      ]).toArray();

    })

    router.post("/getallremindersbycustomers", async (ctx) => {
      let email = ctx.request.body.email
      let product_id = parseInt(ctx.request.body.pid);
      ctx.both = await remind_col.find({shop:process.env.SHOP, email: email, product_id: product_id }).toArray();

      ctx.producttes = [];

      for (let i = 0; i < ctx.both.length; i++) {
        let product = await client.get({ path: `products/${ctx.both[i].product_id}` });
        ctx.producttes.push([
          product.body.product.image.src,
          product.body.product.title,
          product.body.product.variants[0].inventory_quantity,
          product.body.product.variants[0].price,
          ctx.both[i].added_date,
          ctx.both[i].remind_date,
          ctx.both[i].is_reminded === "true" ? "Sent" : "Pending",
        ])
      }

      ctx.body = ctx.producttes;
    })

    router.post("/getallreminders", async (ctx) => {
      let email = ctx.request.body.email
      ctx.both = await remind_col.find({shop:process.env.SHOP, email: email }).toArray();

      ctx.producttes = [];

      for (let i = 0; i < ctx.both.length; i++) {
        let product = await client.get({ path: `products/${ctx.both[i].product_id}` });
        ctx.producttes.push([
          product.body.product.image.src,
          product.body.product.title,
          product.body.product.variants[0].inventory_quantity,
          product.body.product.variants[0].price,
          ctx.both[i].added_date,
          ctx.both[i].remind_date,
          ctx.both[i].is_reminded === "true" ? "Sent" : "Pending",
        ])
      }

      ctx.body = ctx.producttes;

    })

    // User Subscription 
    router.get("/getuserplan", async (ctx) => {
      ctx.body = await subscription_col.find({ shop: process.env.SHOP }).toArray();
    })

    router.post("/subscribe", async (ctx) => {
      let plan_id = ctx.request.body.plan_id;
      let coupon = ctx.request.body.couponcode;
      // check if the coupon is avaiable and active
      let coupon_used = "";
      let coupon_data = await coupon_col.find({ coupon_code: coupon }).toArray();
      if (coupon_data.length > 0 && coupon_data[0].is_active ) {
        coupon_used = coupon;        
      }

      if (await subscription_col.find({ shop: process.env.SHOP }).count() > 0) {
        ctx.body = await subscription_col.updateOne({ shop: process.env.SHOP }, { $set: { user_plan_id: plan_id,coupon_used:coupon_used } },{upsert:true});
      } else {
        ctx.body = await subscription_col.insertOne({ shop: process.env.SHOP, user_plan_id: plan_id,coupon_used:coupon_used });
      }
    })

    router.get("/newplanselected", async (ctx) => {
      let shop = ctx.query.shop || process.env.SHOP;
      await subscription_col.updateOne({ shop: shop }, { $set: { is_selected_a_plan: true } },{upsert:true});
      ctx.redirect(`/auth/inline?shop=${shop}`);
    })

    router.post("/themehelp", async (ctx) => {
      // concatenate email to message
      let body = "FROM:" + ctx.request.body.email + "\n\n" + ctx.request.body.message;
      await mailer.sendMail({
        from: "reminderhero@treaclejar.com",
        to: "help@remindhero.com",
        subject: `[${ctx.request.body.urgency}] Please Help - ${process.env.SHOP}`,
        html: body
      })
      ctx.status = 201
    })

    router.get("/getthemes", async (ctx) => {
      ctx.body = await client.get({ path: `themes` });
    })

    router.post("/applytheme", async (ctx) => {
      let id = ctx.request.body.id;
      // change theme role to main

      ctx.body = await client.put({
        path: `themes/${id}`,
        data: { "theme": { "id": id, "role": "main" } },
        type: DataType.JSON
      });
    })

    router.post("/removetheme", async (ctx) => {
      let id = ctx.request.body.id;
      // change theme role to main

      ctx.body = await client.put({
        path: `themes/${id}`,
        data: { "theme": { "id": id, "role": "unpublished" } },
        type: DataType.JSON
      });
    })


    router.post("/checkcoupon", async (ctx) => {
      let coupon = ctx.request.body.couponcode;
      let coupon_data = await coupon_col.findOne({ coupon_code: coupon });
      console.log(coupon_data)
      if (coupon_data) {
        if (coupon_data.is_active) {
          if(new Date(coupon_data.exp_date)>new Date()){
            ctx.body = {
              status: "success",
              message: "Coupon is valid"
            }
          }else{
            ctx.body = {
              status: "error",
              message: "Coupon is expired"
            }
          }
        }else{
          ctx.body = {
            status: "error",
            message: "Coupon is not active"
          }
        }
      }else {
        ctx.body = {
          status: "error",
          message: "Coupon is not valid"
        }
      }
    })


    router.post("/webhooks", async (ctx) => {
      try {
        await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
        console.log(`Webhook processed, returned status code 200`);
      } catch (error) {
        console.log(`Failed to process webhook: ${error}`);
      }
    });

    router.post(
      "/graphql",
      verifyRequest({ returnHeader: true }),
      async (ctx, next) => {
        await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
      }
    );
    router.get("(/_next/static/.*)", handleRequest); // Static content is clear
    router.get("/_next/webpack-hmr", handleRequest); // Webpack content is clear
    router.get("(.*)", async (ctx) => {
      const shop = ctx.query.shop;

      // This shop hasn't been seen yet, go through OAuth to create a session
      if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
        ctx.redirect(`/auth?shop=${shop}`);
      } else {
        await handleRequest(ctx);
      }
    });

    server.use(router.allowedMethods());
    server.use(router.routes());
    server.listen(port, () => {
      console.log(`> Ready on http://localhost:${port}`);
    });
  });
});