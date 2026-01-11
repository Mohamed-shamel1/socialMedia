
const clinetIo=io("http://localhost:3000/",{
    auth:{authorization:"System eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGM1ZTE3NjhjOTQyM2UzYTdmMDEzNTMiLCJpYXQiOjE3NjEwODk4MTksImV4cCI6MTc2MTA5MzQxOSwianRpIjoiZDQ3OGU1YmMtMWQ2ZC00MTFlLTgzOTUtZjkzYWI3YWJlMzBlIn0.whX9n8kR2PRb9AR6U_iXkAYlQcEMNJVJLWL5qxtjpuI"}
})
// const clinetIo2=io("http://localhost:3000/admin") >>>>> multplacxing or nameSpace
clinetIo.on("connect",(data)=>{
    console.log("connection establish");
    
})
clinetIo.emit("sayHi","Hello frome FE to BE",(res)=>{
    console.log({res});
    
})