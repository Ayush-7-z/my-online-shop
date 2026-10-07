angular
  .module("shopease", [])

  // CSRF guard on the API expects this exact header on state-changing requests.
  .config(function ($httpProvider) {
    $httpProvider.defaults.headers.common["X-Requested-With"] = "fetch";
  })

  .factory("Session", function ($http, $q) {
    var cached = null;
    return {
      get: function () {
        if (cached) return $q.when(cached);
        return $http.get("/api/session.php").then(
          function (r) {
            cached = r.data.user || null;
            return cached;
          },
          function () {
            cached = null;
            return null;
          },
        );
      },
      set: function (u) {
        cached = u;
      },
      logout: function () {
        return $http.delete("/api/session.php").then(function () {
          cached = null;
        });
      },
    };
  })

  .factory("Products", function ($http) {
    return $http.get("/api/products.php").then(function (r) {
      return r.data.products;
    });
  })

  .filter("rupee", function () {
    return function (n) {
      return "₹" + Number(n).toLocaleString("en-IN");
    };
  })

  .filter("price", function () {
    return function (p) {
      return p.price - (p.price * p.discount) / 100;
    };
  })

  .directive("imgFallback", function () {
    return {
      restrict: "A",
      link: function (scope, el) {
        el.on("error", function () {
          el.off("error");
          el.attr("src", "/images/placeholder.svg");
        });
      },
    };
  })

  // ---------- shared header ----------
  .controller("HeaderCtrl", function ($scope, $http, Session, $window) {
    $scope.user = null;
    Session.get().then(function (u) {
      $scope.user = u;
    });
    $http.get("/api/cart.php").then(
      function (r) {
        $scope.cartCount = (r.data.cart || []).reduce(function (s, i) {
          return s + (i.qty || 0);
        }, 0);
      },
      function () {},
    );
    $http.get("/api/wishlist.php").then(
      function (r) {
        $scope.wishCount = (r.data.wishlist || []).length;
      },
      function () {},
    );
    $scope.logout = function () {
      Session.logout().then(function () {
        $window.location.href = "/";
      });
    };
    $scope.goSearch = function () {
      $window.location.href =
        "/products.html?q=" + encodeURIComponent($scope.search || "");
    };
  })

  // ---------- home ----------
  .controller("HomeCtrl", function ($scope, Products, $http, $window) {
    Products.then(function (products) {
      $scope.categories = [];
      products.forEach(function (p) {
        if ($scope.categories.indexOf(p.category) === -1)
          $scope.categories.push(p.category);
      });
      $scope.featured = products.slice(0, 8);
    });
    $scope.addToCart = function (p) {
      $http.post("/api/cart.php", { product_id: p.id, quantity: 1 }).then(
        function () {
          $scope.msg = p.name + " Added to cart";
        },
        function (r) {
          if (r.status === 401) {
            $window.location.href = "/login.html";
          } else {
            $scope.msg = (r.data && r.data.error) || "Please log in first";
          }
        },
      );
    };
  })

  // ---------- products ----------
  .controller("ProductsCtrl", function ($scope, Products, $window) {
    var params = new URLSearchParams($window.location.search);
    $scope.q = params.get("q") || "";
    $scope.category = params.get("category") || "";
    $scope.sort = "";
    Products.then(function (products) {
      $scope.all = products;
    });
    $scope.list = function () {
      var out = ($scope.all || []).filter(function (p) {
        var okQ =
          !$scope.q ||
          (p.name + " " + p.brand)
            .toLowerCase()
            .indexOf($scope.q.toLowerCase()) !== -1;
        var okC = !$scope.category || p.category === $scope.category;
        return okQ && okC;
      });
      if ($scope.sort === "low")
        out.sort(function (a, b) {
          return a.price - (a.price * a.discount) / 100 - (b.price - (b.price * b.discount) / 100);
        });
      if ($scope.sort === "high")
        out.sort(function (a, b) {
          return b.price - (b.price * b.discount) / 100 - (a.price - (a.price * a.discount) / 100);
        });
      return out;
    };
    $scope.categories = function () {
      var c = [];
      ($scope.all || []).forEach(function (p) {
        if (c.indexOf(p.category) === -1) c.push(p.category);
      });
      return c;
    };
    $scope.addToCart = function (p) {
      $http.post("/api/cart.php", { product_id: p.id, quantity: 1 }).then(
        function () {
          $scope.msg = p.name + " Added to cart";
        },
        function (r) {
          if (r.status === 401) {
            $window.location.href = "/login.html";
          } else {
            $scope.msg = (r.data && r.data.error) || "Please log in first";
          }
        },
      );
    };
  })

  // ---------- product details ----------
  .controller("ProductCtrl", function ($scope, Products, $http, $window) {
    var id = Number(new URLSearchParams($window.location.search).get("id"));
    Products.then(function (products) {
      $scope.product = products.find(function (p) {
        return p.id === id;
      });
    });
    $scope.addToCart = function () {
      $http.post("/api/cart.php", { product_id: id, quantity: 1 }).then(
        function () {
          $scope.msg = "Added to cart";
        },
        function (r) {
          if (r.status === 401) {
            $window.location.href = "/login.html";
          } else {
            $scope.msg = (r.data && r.data.error) || "Please log in first";
          }
        },
      );
    };
    $scope.addToWishlist = function () {
      $http.post("/api/wishlist.php", { product_id: id }).then(
        function () {
          $scope.msg = "Added to wishlist";
        },
        function (r) {
          if (r.status === 401) {
            $window.location.href = "/login.html";
          } else {
            $scope.msg = (r.data && r.data.error) || "Please log in first";
          }
        },
      );
    };
  })

  // ---------- cart ----------
  .controller("CartCtrl", function ($scope, $http, $window) {
    function load() {
      $http.get("/api/cart.php").then(
        function (r) {
          $scope.items = r.data.cart;
        },
        function () {
          $window.location.href = "/login.html";
        },
      );
    }
    load();
    $scope.qty = function (item, d) {
      var q = item.qty + d;
      if (q < 1) return;
      $http
        .put("/api/cart.php", { product_id: item.id, quantity: q })
        .then(load);
    };
    $scope.remove = function (item) {
      $http
        .delete("/api/cart.php", { data: { product_id: item.id } })
        .then(load);
    };
    $scope.clear = function () {
      $http.delete("/api/cart.php", { data: {} }).then(load);
    };
    $scope.unit = function (p) {
      return p.price - (p.price * p.discount) / 100;
    };
    $scope.subtotal = function () {
      return ($scope.items || []).reduce(function (s, i) {
        return s + $scope.unit(i) * i.qty;
      }, 0);
    };
  })

  // ---------- wishlist ----------
  .controller("WishlistCtrl", function ($scope, $http, $window) {
    function load() {
      $http.get("/api/wishlist.php").then(
        function (r) {
          $scope.items = r.data.wishlist;
        },
        function () {
          $window.location.href = "/login.html";
        },
      );
    }
    load();
    $scope.remove = function (p) {
      $http
        .delete("/api/wishlist.php", { data: { product_id: p.id } })
        .then(load);
    };
    $scope.addToCart = function (p) {
      $http
        .post("/api/cart.php", { product_id: p.id, quantity: 1 })
        .then(function () {
          $scope.msg = p.name + " Added to cart";
        }, function (r) {
          if (r.status === 401) {
            $window.location.href = "/login.html";
          } else {
            $scope.msg = (r.data && r.data.error) || "Please log in first";
          }
        });
    };
    $scope.unit = function (p) {
      return p.price - (p.price * p.discount) / 100;
    };
  })

  // ---------- login / register ----------
  .controller("LoginCtrl", function ($scope, $http, Session, $window) {
    $scope.submit = function () {
      $scope.error = "";
      $http
        .post("/api/login.php", {
          email: $scope.email,
          password: $scope.password,
        })
        .then(
          function (r) {
            Session.set(r.data.user);
            $window.location.href = "/";
          },
          function (r) {
            $scope.error = (r.data && r.data.error) || "Login failed";
          },
        );
    };
  })

  .controller("RegisterCtrl", function ($scope, $http, Session, $window) {
    $scope.submit = function () {
      $scope.error = "";
      $http
        .post("/api/register.php", {
          name: $scope.name,
          email: $scope.email,
          phone: $scope.phone,
          password: $scope.password,
        })
        .then(
          function (r) {
            Session.set(r.data.user);
            $window.location.href = "/";
          },
          function (r) {
            $scope.error = (r.data && r.data.error) || "Registration failed";
          },
        );
    };
  })

  // ---------- checkout ----------
  .controller("CheckoutCtrl", function ($scope, $http, $window, Session) {
    $scope.subtotal = 0;
    $scope.gst = 0;
    $scope.delivery = 0;
    $scope.total = 0;
    Session.get().then(function (u) {
      $scope.user = u;
    });
    $http.get("/api/cart.php").then(
      function (r) {
        $scope.items = r.data.cart;
        sync();
      },
      function () {
        $window.location.href = "/login.html";
      },
    );
    function sync() {
      $scope.subtotal = ($scope.items || []).reduce(function (s, i) {
        return s + (i.price - (i.price * i.discount) / 100) * i.qty;
      }, 0);
      $scope.gst = Math.round($scope.subtotal * 0.18 * 100) / 100;
      $scope.delivery = $scope.subtotal >= 500 ? 0 : 49;
      $scope.total = $scope.subtotal + $scope.gst + $scope.delivery;
    }
    $scope.place = function () {
      $scope.error = "";
      $http.post("/api/order.php", { address: $scope.address }).then(
        function (r) {
          $window.location.href =
            "/order-confirmation.html?id=" + r.data.order.id;
        },
        function (r) {
          $scope.error = (r.data && r.data.error) || "Failed to place order";
        },
      );
    };
  })

  // ---------- orders ----------
  .controller("OrdersCtrl", function ($scope, $http, $window) {
    $http.get("/api/orders.php").then(
      function (r) {
        $scope.orders = r.data.orders;
      },
      function () {
        $window.location.href = "/login.html";
      },
    );
  })

  .controller("OrderCtrl", function ($scope, $http, $window) {
    var id = Number(new URLSearchParams($window.location.search).get("id"));
    $http.get("/api/orders.php").then(function (r) {
      $scope.order = (r.data.orders || []).find(function (o) {
        return Number(o.id) === id;
      });
    });
  });
