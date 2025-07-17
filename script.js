function sendMail(){
    let parms = {
        name : document.getElementById("name"),value,
        email : document.getElementById("email").value,
        subject: document.getElementById("subject").value,
        message: document.getElementById("message").value,

    }
    emailjs.send("service_t5qcgjv","template_f1tvom3").then(alert("Email Sent!!!"))
}