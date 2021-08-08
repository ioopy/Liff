var cart = {
  // (A) PROPERTIES
  hPdt : null, // HTML products list
  hItems : null, // HTML current cart
  items : {}, // Current items in cart

  // (B) LOCALSTORAGE CART
  // (B1) SAVE CURRENT CART INTO LOCALSTORAGE
  save : function () {
    localStorage.setItem("cart", JSON.stringify(cart.items));
  },

  liffopen : function() {
    localStorage.clear();
    liff
        .init({ liffId: "1656113675-9kwWBZQz" })
        .then(() => {
            cart.init();
        })
        .catch((err) => {
            console.error(err.code, error.message);
        });
  },

  // (B2) LOAD CART FROM LOCALSTORAGE
  load : function () {
    cart.items = localStorage.getItem("cart");
    if (cart.items == null) { cart.items = {}; }
    else { cart.items = JSON.parse(cart.items); }
  },

  // (B3) EMPTY ENTIRE CART
  nuke : function () {
    if (confirm("Empty cart?")) {
      cart.items = {};
      localStorage.removeItem("cart");
      cart.list();
    }
  },

  // (C) INITIALIZE
  init : function () {
    // (C1) GET HTML ELEMENTS
    cart.hPdt = document.getElementById("cart-products");
    cart.hItems = document.getElementById("cart-items");

    // (C2) DRAW PRODUCTS LIST
    cart.hPdt.innerHTML = "";
    let p, item, part;
    for (let id in products) {
      // WRAPPER
      p = products[id];
      item = document.createElement("div");
      item.className = "p-item";
      cart.hPdt.appendChild(item);

      // PRODUCT IMAGE
      part = document.createElement("img");
      part.src = p.img;
      part.className = "p-img";
      item.appendChild(part);

      // PRODUCT NAME
      part = document.createElement("div");
      part.innerHTML = p.name;
      part.className = "p-name";
      item.appendChild(part);

      // PRODUCT DESCRIPTION
      part = document.createElement("div");
      part.innerHTML = p.desc;
      part.className = "p-desc";
      item.appendChild(part);

      // PRODUCT PRICE
      part = document.createElement("div");
      part.innerHTML =  p.price + " ฿";
      part.className = "p-price";
      item.appendChild(part);

      // ADD TO CART
      part = document.createElement("input");
      part.type = "button";
      part.value = "Add to Cart";
      part.className = "cart p-add";
      part.onclick = cart.add;
      part.dataset.id = id;
      item.appendChild(part);
    }

    // (C3) LOAD CART FROM PREVIOUS SESSION
    cart.load();

    // (C4) LIST CURRENT CART ITEMS
    cart.list();
  },

  // (D) LIST CURRENT CART ITEMS (IN HTML)
  list : function () {
    // (D1) RESET
    cart.hItems.innerHTML = "";
    let item, part, pdt;
    let empty = true;
    for (let key in cart.items) {
      if(cart.items.hasOwnProperty(key)) { empty = false; break; }
    }

    // (D2) CART IS EMPTY
    if (empty) {
      item = document.createElement("div");
      item.innerHTML = "Cart is empty";
      cart.hItems.appendChild(item);
    }

    // (D3) CART IS NOT EMPTY - LIST ITEMS
    else {
      let p, total = 0, subtotal = 0;
      for (let id in cart.items) {
        // ITEM
        p = products[id];
        item = document.createElement("div");
        item.className = "c-item";
        cart.hItems.appendChild(item);

        // NAME
        part = document.createElement("div");
        part.innerHTML = p.name;
        part.className = "c-name";
        item.appendChild(part);

        // REMOVE
        part = document.createElement("input");
        part.type = "button";
        part.value = "X";
        part.dataset.id = id;
        part.className = "c-del cart";
        part.addEventListener("click", cart.remove);
        item.appendChild(part);

        // QUANTITY
        part = document.createElement("input");
        part.type = "number";
        part.value = cart.items[id];
        part.dataset.id = id;
        part.className = "c-qty";
        part.addEventListener("change", cart.change);
        item.appendChild(part);

        // SUBTOTAL
        subtotal = cart.items[id] * p.price;
        total += subtotal;
      }

      // EMPTY BUTTONS
      item = document.createElement("input");
      item.type = "button";
      item.value = "Empty";
      item.addEventListener("click", cart.nuke);
      item.className = "c-empty cart";
      cart.hItems.appendChild(item);

      // CHECKOUT BUTTONS
      item = document.createElement("input");
      item.type = "button";
      item.value = "Checkout - " + "$" + total;
      item.addEventListener("click", cart.checkout);
      item.className = "c-checkout cart";
      cart.hItems.appendChild(item);
    }
  },

  // (E) ADD ITEM INTO CART
  add : function () {
    if (cart.items[this.dataset.id] == undefined) {
      cart.items[this.dataset.id] = 1;
    } else {
      cart.items[this.dataset.id]++;
    }
    cart.save();
    cart.list();
  },

  // (F) CHANGE QUANTITY
  change : function () {
    if (this.value == 0) {
      delete cart.items[this.dataset.id];
    } else {
      cart.items[this.dataset.id] = this.value;
    }
    cart.save();
    cart.list();
  },
  
  // (G) REMOVE ITEM FROM CART
  remove : function () {
    delete cart.items[this.dataset.id];
    cart.save();
    cart.list();
  },
  
  // (H) CHECKOUT
  checkout : function () {
    let userId = '';
    let price_total = 0;

    for (let ci in cart.items) {
      var getPrice = products[ci];
      price_total = price_total + getPrice.price;
    }
    console.log(price_total);
    let dataObject = cart.getMsgApi(price_total, userId);
    let url_script = "https://script.google.com/macros/s/AKfycbxx8XufwPeOwhlnLNejbg0D0eTsG_tlAwO6BLJT_2bR3jipDiVHEvpjGhWg0GClGSMNBQ/exec";
    let param = "&total="+price_total+"&data="+dataObject;
    let url = url_script + "?callback=alert('test')"+param;
    var req_script = jQuery.ajax({
      crossDomain: true,
      url: url,
      method: "GET",
      dataType: "jsonp"
    });
    if(userId === '') {
      userId = 'U3ea66bd920df54678a4e05826910c3f4';
    }
    alert(userId);
     var sendMsg = jQuery.ajax({
      url: "https://api.line.me/v2/bot/message/push",
      method: "POST",
      contentType : 'application/json',
      headers: {"Authorization": "Bearer +jHhnR4aD3dSZu44kHObjYxqJBZuSIPw1MjVSAjbn6ofZeWqfyQ2b2c3IefpRe0UOCVjVgca2IGYwxUddIEUtso1/lICfxTgAj22M7OmuL31T1EC6H0qOEiezn/QVYUh9AmxcAT0+ifirYBBUx3zhwdB04t89/1O/w1cDnyilFU="},
      data: cart.genMsg(userId)
    });

    if (
            liff.getContext().type !== "none" &&
            liff.getContext().type !== "external"
        ) {
          liff.closeWindow();
            // Create flex message
            // let message = cart.genMsg();
            
            // Send messages
            // liff
            //     .sendMessages(message)
            //     .then(() => {
            //         liff.closeWindow();
            //     })
            //     .catch((err) => {
            //         alert(error.message);
            //         console.error(err.code, error.message);
            //     });
            
        }
  },

  getMsgApi : function(total, userIdline) {
    let templateJson = {
      action: "Insert",
      data : [
        
      ]
    }
    for (let prdId in cart.items) {
      var haiya = products[prdId];
      let dataJson = {
        productId: prdId,
        productName: haiya.name,
        productDesc: haiya.desc,
        productPrice: haiya.price,
        productTotal: total,
        userId: userIdline
      }
      templateJson.data.push(dataJson);

    }
    return JSON.stringify(templateJson);
  },

  genMsg : function(e) {
    let flexJson = {
                    type: "bubble",
                    size: "giga",
                    body: {
                        type: "box",
                        layout: "vertical",
                        contents: [
                            {
                                type: "box",
                                layout: "horizontal",
                                contents: [
                                    {
                                        type: "text",
                                        text: "สรุปรายการสินค้า",
                                        size: "xl",
                                        color: "#0551c2ff",
                                        weight: "bold",
                                        align: "center"
                                    }
                                ]
                            },
                            {
                                type: "separator",
                                margin: "lg"
                            },
                            {
                                type: "box",
                                layout: "horizontal",
                                contents: [
                                    {
                                        type: "box",
                                        layout: "vertical",
                                        contents: [
                                            {
                                                type: "text",
                                                text: "รายการ",
                                                size: "sm"
                                            }
                                        ],
                                        width: "110px"
                                    },
                                    {
                                        type: "box",
                                        layout: "vertical",
                                        contents: [
                                            {
                                                type: "text",
                                                text: "ราคา",
                                                size: "sm",
                                                align: "end",
                                                weight: "bold"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ],
                        spacing: "md"
                    },
                    footer: {
                        type: "box",
                        layout: "vertical",
                        contents: [
                            {
                                type: "button",
                                action: {
                                    type: "uri",
                                    label: "สอบถามเพิ่มเติม",
                                    uri: "https://www.google.com"
                                },
                                style: "primary"
                            }
                        ]
                    }
                };
    let sumprice = 0;
    for (let itemId in cart.items) {
      var productCart = products[itemId];
      let productNameDesc = productCart.name + " " + productCart.desc;
      let priceProduct = productCart.price;
      
      sumprice = sumprice + productCart.price;
      let detail =  {};
      detail = 
      {
        type: "box",
        layout: "horizontal",
        contents: [
            {
                type: "box",
                layout: "vertical",
                contents: [
                    {
                        type: "text",
                        text: productNameDesc + "",
                        size: "sm"
                    }
                ],
                width: "110px"
            },
            {
                type: "box",
                layout: "vertical",
                contents: [
                    {
                        type: "text",
                        text: priceProduct + "",
                        size: "sm",
                        align: "end",
                        weight: "bold"
                    }
                ]
            }
        ]
    };
     
    flexJson.body.contents.push(detail);
    }

    let toTalContent = {
        type: "box",
        layout: "horizontal",
        contents: [
            {
                type: "box",
                layout: "vertical",
                contents: [
                    {
                        type: "text",
                        text: "ยอดรวม",
                        size: "sm"
                    }
                ],
                width: "110px"
            },
            {
                type: "box",
                layout: "vertical",
                contents: [
                    {
                        type: "text",
                        text: sumprice + "",
                        size: "sm",
                        align: "end",
                        weight: "bold"
                    }
                ]
            }
        ]
    };
    flexJson.body.contents.push(toTalContent);
    return {to: e, messages: [{ type: "flex", altText: "สรุปรายการสั่งซื้อ", contents: flexJson }]};
    // return [{ type: "flex", altText: "สรุปรายการสั่งซื้อ", contents: flexJson }];

  }
  
    
};

window.addEventListener("DOMContentLoaded", cart.liffopen);
