const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const async = require("hbs/lib/async");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE,
  });

  exports.login = async(req, res) => {
    try {
        const { name,email, password,videolectures,nptel,slideshare,ndl,delnet,spokentutorial,blogspot} = req.body;
        // console.log(email);
        // console.log(password);
        // console.log(videolectures);
        // console.log(nptel);
        // console.log(slideshare);
        // console.log(ndl);
        // console.log(delnet);
        // console.log(spokentutorial);
        // console.log(blogspot);
        let logintime = new Date();
        
            //console.log(hashedPassword);
            

              db.query("select * from users where email=?",
              [email],
              async(error,result)=>{
                const hash = result[0].PASS.replace("$2y$", "$2a$");
                if(result.length<=0){
                  return res.render("index",{msg:"User does not exists ,please Create account :) !"});

                }
                else if(!(await bcrypt.compare(password,hash))){
                  return res.render("index",{msg:"Password does not match :(  , If you have forgotten contact site admin(Lavan) or College admin staff ."});
                }
                else {
                   // console.log(result);
                    db.query(
                      "insert into purpose set ?",
                      { name: name, email: email,videolectures: videolectures,nptel: nptel,slideshare: slideshare,ndl: ndl,delnet: delnet,spokentutorial: spokentutorial,blogspot: blogspot,logintime: logintime},
                      (error, result) => {
                        if (error) {
                          console.log(error);
                        } 
                      }
                    );
                    const id = result[0].ID;
                    const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
                      expiresIn: process.env.JWT_EXPIRES_IN,
                    });

                    console.log("The Token is " + token);
                    const cookieOptions = {
                      expires: new Date(
                        Date.now() +
                          process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                      ),
                      httpOnly: true,
                    };
                    res.cookie("lavan", token, cookieOptions);
                    res.status(200).redirect("/home");
                  


                  
                  }  
            }
             
              );
       


        
    } catch (error) {
        console.log(error);
    }
  };
exports.register = (req, res) => {
//res.send("Form submitted")  
// console.log(req.body);
// const name = req.body.name;
// const email = req.body.email;
// const password = req.body.password;
const { name, email, password ,cpassword} = req.body;
// console.log(name);
// console.log(email);
db.query("select email from users where email=?",[email],async (error,result) =>{
        if (error){
            console.log(error);
        }
        if(result.length > 0){
            return res.render("register",{msg:"Email ID already Taken"});
        }else if(password!==cpassword){
            return res.render("register",{msg:"Password does not match !"});
        }
        let hashedPassword = await bcrypt.hash(password, 8);
        //console.log(hashedPassword);
        db.query(
            "insert into users set ?",
            { name: name, email: email, pass: hashedPassword },
            (error, result) => {
              if (error) {
                console.log(error);
              } else {
                //console.log(result);
                return res.render("register", {
                  msg: "User Registration Success",
                  msg_type: "good",
                });
              }
            }
          );
    }


);
};

exports.isLoggedIn = async (req, res, next) => {
  //req.name = "Check Login....";
  //console.log(req.cookies);
  if (req.cookies.lavan) {
    try {
      const decode = await promisify(jwt.verify)(
        req.cookies.lavan,
        process.env.JWT_SECRET
      );
      //console.log(decode);
      db.query(
        "select * from users where id=?",
        [decode.id],
        (err, results) => {
          //console.log(results);
          if (!results) {
            return next();
          }
          req.user = results[0];
          return next();
        }
      );
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    next();
  }
};  

exports.logout = async (req, res) => {
  const decode = await promisify(jwt.verify)(
    req.cookies.lavan,
    process.env.JWT_SECRET
  );
   let lo=(decode.id);
   let final=lo;
  db.query(
    "select * from users where id=?",
    [final],
    (err, result) => {
      //console.log(results);
      if (!result) {
        return next();
      }
      req.user = result[0];
      let lname=result[0];
      let name=lname.NAME;
      let email=lname.EMAIL;
      let logoutdate=new Date();

    db.query(
                      "insert into logout set ?",
                      { name: name, email: email,logoutdate: logoutdate},
                      (error, result) => {
                        if (error) {
                          console.log(error);
                        } 
                      }
                    );
                    const id = result[0].ID;
                    const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
                      expiresIn: process.env.JWT_EXPIRES_IN,
                    });

    
      //return next();
    }
  );
  
  res.cookie("lavan", "logout", {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true,
  });
  res.status(200).redirect("/");
};
