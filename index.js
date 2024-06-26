const express = require("express");
const app = express();
const path = require("path");
const config = require("./config/config.json");
const { Sequelize, QueryTypes } = require("sequelize");
const sequelize = new Sequelize(config.development);
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src/views"));
app.use("/assets", express.static(path.join(__dirname, "/src/assets")));

app.use(express.urlencoded({ extended: false }));

app.use(flash());

app.use(
  session({
    //nama session
    name: "data",
    //sandi
    secret: "secretpassword",
    // biar session datanya tidak disimpan kembali, diseting false biar data yg gak penting gak disimpen ulang
    resave: false,
    // ini untuk menyimpan datanya yg kita inisialisasi, kita true biar sesinya kita save
    saveUninitialized: true,
    cookie: {
      // keamanan karna kita jalaninnya di HTTP(lokal), bukan global (M1) atau HTTPS
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.get("/", home);
app.get("/register", registerView);
app.get("/login", loginView);
app.get("/logout", logout);

app.get("/collection", collectionView);
app.get("/task/:id", taskView);

app.post("/register", registerUser);
app.post("/login", loginUser);

app.post("/collection/", addCollection);
app.post("/delete/:id", deleteCollection);
app.post("/task/:id", addTask);
app.post("/done/:id", doneTask);
app.post("/undone/:id", unDoneTask);
app.post("/deleteTask/:id", deleteTask);

async function home(req, res) {
  const isLogin = req.session.isLogin;
  const user = req.session.user;

  const query = `SELECT *
  FROM public.collection_tbs
  ORDER BY id DESC`;
  const objCollection = await sequelize.query(query, { type: QueryTypes.SELECT });

  res.render("index", { objCollection, isLogin, user });
}

function registerView(req, res) {
  res.render("register-form");
}

function loginView(req, res) {
  res.render("login-form");
}

function collectionView(req, res) {
  const isLogin = req.session.isLogin;
  const user = req.session.user;

  res.render("collection", { isLogin, user });
}

async function taskView(req, res) {
  const { id } = req.params;
  const isLogin = req.session.isLogin;
  const user = req.session.user;
  let isComplete;
  let isUser;

  //ini ambil data collection dari table collection
  const queryCollection = `SELECT collection_tbs.id, name, user_id, username
	FROM collection_tbs
	LEFT JOIN users_tbs  
	ON collection_tbs.user_id = users_tbs.id
	WHERE collection_tbs.id='${id}';`;
  const objCollection = await sequelize.query(queryCollection, { type: QueryTypes.SELECT });
  const collection = objCollection[0];

  console.log("Collection id nya nih: " + collection.id);

  //ini ambil seluruh data task berdasarkan collection dari table task
  const queryTask = `SELECT *
	FROM public.task_tbs
	WHERE collections_id='${id}'
  ORDER BY id DESC`;
  const objTask = await sequelize.query(queryTask, { type: QueryTypes.SELECT });

  //ini ambil seluruh data task yang BELUM selesai berdasarkan collection dari table task
  const queryTaskFalse = `SELECT *
	FROM public.task_tbs
	WHERE collections_id='${id}' AND is_done=False
  ORDER BY id DESC;`;
  const objTaskFalse = await sequelize.query(queryTaskFalse, { type: QueryTypes.SELECT });

  //ini ambil seluruh data task yang SUDAH selesai berdasarkan collection dari table task
  const queryTaskTrue = `SELECT *
	FROM public.task_tbs
	WHERE collections_id='${id}' AND is_done=True
  ORDER BY id DESC;`;
  const objTaskTrue = await sequelize.query(queryTaskTrue, { type: QueryTypes.SELECT });

  //kondisi untuk cek tasknya sudah selesai semua atau belum
  if (objTask.length == 0) {
    isComplete = false;
  } else if (objTaskTrue.length == objTask.length) {
    isComplete = true;
  } else {
    isComplete = false;
  }

  //kondisi untuk mencocokan apakah collectionnya punya user yang membuatnya
  try {
    if (collection.user_id == user.id) {
      isUser = true;
    } else {
      isUser = false;
    }
  } catch (err) {
    isUser = false;
    console.log("id user tidak ditemukan");
  }

  res.render("task", { collection, objTask, objTaskFalse, objTaskTrue, isLogin, user, isComplete, isUser });
}

async function addCollection(req, res) {
  const { collectionName, userId } = req.body;

  const query = `INSERT INTO public.collection_tbs(name, user_id)
  VALUES ('${collectionName}', '${userId}');`;
  const obj = await sequelize.query(query, { type: QueryTypes.INSERT });

  res.redirect("/");
}

async function deleteCollection(req, res) {
  const { id } = req.params;

  const query = `DELETE FROM public.collection_tbs
	WHERE id=${id};`;
  const obj = await sequelize.query(query, { type: QueryTypes.DELETE });

  res.redirect("/");
}

async function addTask(req, res) {
  const { task } = req.body;
  const { id } = req.params;
  const isDone = false;

  console.log("Id nya adalah: " + id);
  const query = `INSERT INTO public.task_tbs(name, is_done, collections_id)
  VALUES ('${task}', '${isDone}', '${id}');`;
  const obj = await sequelize.query(query, { type: QueryTypes.INSERT });

  res.redirect(`${id}`);
}

async function doneTask(req, res) {
  const { id } = req.params;

  const querySelect = `SELECT * FROM public.task_tbs
	WHERE id='${id}';`;
  const objSelect = await sequelize.query(querySelect, { type: QueryTypes.SELECT });

  const query = `UPDATE public.task_tbs
	SET is_done=True
	WHERE id='${id}';`;
  const obj = await sequelize.query(query, { type: QueryTypes.UPDATE });

  res.redirect(`/task/${objSelect[0].collections_id}`);
}

async function unDoneTask(req, res) {
  const { id } = req.params;

  const querySelect = `SELECT * FROM public.task_tbs
	WHERE id='${id}';`;
  const objSelect = await sequelize.query(querySelect, { type: QueryTypes.SELECT });

  const query = `UPDATE public.task_tbs
	SET is_done=False
	WHERE id='${id}';`;
  const obj = await sequelize.query(query, { type: QueryTypes.UPDATE });

  res.redirect(`/task/${objSelect[0].collections_id}`);
}

async function deleteTask(req, res) {
  const { id } = req.params;

  const querySelect = `SELECT * FROM public.task_tbs
	WHERE id='${id}';`;
  const objSelect = await sequelize.query(querySelect, { type: QueryTypes.SELECT });

  const query = `DELETE FROM public.task_tbs
	WHERE id='${id}';`;
  const obj = await sequelize.query(query, { type: QueryTypes.DELETE });

  res.redirect(`/task/${objSelect[0].collections_id}`);
}

async function registerUser(req, res) {
  const { userName, email, password } = req.body;

  //validation
  console.log("Email validation check");
  const query = `SELECT *
  FROM public.users_tbs
  WHERE email='${email}';`;
  const obj = await sequelize.query(query, { type: QueryTypes.SELECT });

  if (obj.length > 0) {
    req.flash("danger", "Register Failed: email has been registered");
    console.log("Email validation check end: error");
    return res.redirect("/register");
  }
  console.log("Email validation check end: success");
  //validation end

  bcrypt.hash(password, 10, async (err, hash) => {
    if (err) {
      req.flash("danger", "Register Failed: password failed to encrypt");
      return res.redirect("/register");
    }

    const query = `INSERT INTO public.users_tbs(email, username, password)
    VALUES ('${email}', '${userName}', '${hash}');`;

    const obj = await sequelize.query(query, { type: QueryTypes.INSERT });

    req.flash("success", "Register Success!");
    res.redirect("/login");
  });
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  //validation
  const query = `SELECT *
  FROM public.users_tbs
  WHERE email='${email}';`;
  const obj = await sequelize.query(query, { type: QueryTypes.SELECT });

  if (obj.length == 0) {
    req.flash("danger", "Login Failed: email not registered");
    return res.redirect("/login");
  }
  //validation end

  bcrypt.compare(password, obj[0].password, (err, result) => {
    if (err) {
      req.flash("danger", "Login Failed: Internal Server Error");
      return res.redirect("/login");
    }

    if (!result) {
      req.flash("danger", "Login Failed: Password is wrong");
      return res.redirect("/login");
    }

    req.flash("success", "Login Success!");
    req.session.isLogin = true;
    req.session.user = {
      id: obj[0].id,
      username: obj[0].username,
      email: obj[0].email,
    };

    res.redirect("/");
  });
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/login");
  });
}

app.listen(3000, () => {
  console.log(`Server berjalan pada port 3000`);
});
