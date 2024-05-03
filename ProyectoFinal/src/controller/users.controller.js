import userModel from "../dao/models/users.model.js";
import {userService} from "../repository/index.repository.js";
import {sendEmailInactiveUser} from "../config/gmail.js";

class UsersController {

    static async getUsers(req, res) {
        try {
            const users = await userService.getAll();
            res.send({
                status: "success",
                users: users
            });
        } catch (error) {
            req.logger.error("Error getting all users");
            res.status(500).send({
                status: 'error',
                msg: 'Internal server error',
            });
        }
    }

    static async updateUser(req, res) {
        try {
            const uid = req.body.uid;
            const newRole = req.body.role
            const user = await userModel.findOne({_id: uid});

            if(newRole === user.role){
                return res.status(404).send({ error: 'Cannot update a user with a role they already had' });
            }
            user.role = newRole

            const result = await userService.updateUser(uid, user);
            return res.status(200).send({ message: 'User modified', result });
        } catch (error) {
            return res.status(500).send({ error: 'Internal server error' });
        }
    }

    static deleteUser = async (req, res) => {
        try {
            const userId = req.query.id;
            const user = await userModel.findOne({_id: userId});
            const deleteUser = await userService.deleteUser(user)

            res.status(200).send({ status: "success", payload: deleteUser })

        } catch (error) {
            console.log(error)
            res.status(500).send({ status: "error", error: "Error removing user" })

        }
    }

    static async removeInactiveUsers(req, res) {
        try {
            const twoDaysAgo  = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
            const inactiveUsers = await userModel.find({ last_connection: { $lt: twoDaysAgo  } }, 'email');
            const deleteResult = await userModel.deleteMany({ last_connection: { $lt: twoDaysAgo  } });

            const deletedCount = deleteResult.deletedCount;

            if (deletedCount > 0) {
                await Promise.all(inactiveUsers.map(async (user) => {
                    await sendEmailInactiveUser(user.email);
                    console.log(`Correo electrónico enviado a ${user.email}`);
                }));
            }

            res.send({
                status: "success",
                message: `${deletedCount} inactive users successfully deleted`
            });
        } catch (error) {
            console.error("Error removing inactive users:", error);
            res.status(500).send({
                status: 'error',
                msg: 'Internal server error',
            });
        }
    }

    static addDocuments = async(req,res)=> {

        const uid = req.params.uid;
        const filename = req.file.filename
        const user = await userModel.findOne({_id: uid});



        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if(!filename) {
            return res.status(400).send({status:"error", error:"The document could not be loaded"})
        }

        const document = {
            name: filename,
            reference: `http://localhost:8080/files/documents/${filename}`
        }

        user.documents.push(document)

        const result = await userModel.updateOne({_id: uid}, {$set: user});

        return res.status(200).json({ message: 'Document uploaded successfully', result });

    }

    static async changeRole(req, res) {
        const {uid} = req.params;

        if (!uid) return res.status(400).send({
            status: "error",
            message: "Incorrect data"
        });

        const user = await userModel.findOne({_id: uid});
        if (!user) return res.status(400).send({
            status: "error",
            message: "Nonexistent user"
        });

        // Check if the user has uploaded at least 3 documents
        if (user.documents.length < 3 && user.role !== "premium") {
            return res.status(400).send({
                status: "error",
                message: "User must upload at least 3 documents to upgrade to premium role"
            });
        }

        // Check if the user has uploaded all required documents before upgrading to premium
        if (user.role === "user" && user.documents.length < 3) {
            return res.status(400).send({
                status: "error",
                message: "User has not finished processing their documentation"
            });
        }

        let newRole
        if (user.role === "user"){
            newRole = "premium";
        }else {
            newRole = "user"
        }

        const response = await userModel.updateOne({_id: user._id}, {$set: {role: newRole}});

        res.send({
            status: "success",
            message: "Modified role",
            response
        });
    }
}

export {UsersController}