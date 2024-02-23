import { fileURLToPath } from "url";
import { dirname } from "path";
import multer from "multer";
import bcrypt from "bcrypt";
import {transport} from "./config/gmail.js";

export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const validatePassword = (password, user) => bcrypt.compareSync(password, user.password);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default __dirname;

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,`${__dirname}/public/images`);
    },
    filename:function(req,file,cb){
        cb(null,`${Date.now()}-${file.originalname}`)
    }
})

export const uploader = multer({storage});

export const emailSender = async (UserEmail) => {
    try {
        let emailTemplate = `<div>
<h1>Gracias por tu compra!!</h1>
<img src="https://fs-prod-cdn.nintendo-europe.com/media/images/10_share_images/portals_3/2x1_SuperMarioHub.jpg" style="width:250px"/>
<p>Esperamos verte de nuevo</p>
<a href="https://localhost:8080">Visitar</a>
</div>`;

        const content = await transport.sendMail({
            from: "Ecommerce",
            to: UserEmail,
            subject: "Conmfirmación de compra",
            html: emailTemplate
        })
        console.log("Contenido", content)
        return "ok";

    } catch (error) {
        console.log(error.message);
        return "fail";
    }
}