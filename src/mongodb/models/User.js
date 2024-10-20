import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true }
});

const qrSchema = new mongoose.Schema({
    qrid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    qr: { type: String, required: true },
    created: { type: Date, default: Date.now },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]  // References to User model
});

const messageSchema = new mongoose.Schema({
    uid: { type: String, required: true },
    qrid: { type: String, required: true },
    message: { type: String, required: true },
    created: { type: Date, default: Date.now },
    name: { type: String, required: true }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const QR = mongoose.models.QR || mongoose.model('QR', qrSchema);
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

// Create a new user
export const createUser = async (data) => {
    try {
        const user = new User(data);
        await user.save();
        return user;
    } catch (error) {
        console.error("Error creating user: ", error);
        throw error;
    }
};

// Create a new QR code
export const createQR = async (data) => {
    try {
        const qr = new QR(data);
        await qr.save();
        return qr;
    } catch (error) {
        console.error("Error creating QR: ", error);
        throw error;
    }
};

// Read a QR code
export const readQR = async (qrid) => {
    try {
        const qr = await QR.findOne({ qrid }).populate('members');
        return qr;
    } catch (error) {
        console.error("Error reading QR: ", error);
        throw error;
    }
};

// Add a new message
export const addNewMessage = async (data) => {
    try {
        const message = new Message(data);
        await message.save();
        return message;
    } catch (error) {
        console.error("Error adding message: ", error);
        throw error;
    }
};

// Add a member to the QR if they don't exist
export const addMemberToQR = async (qrid, uid) => {
    try {
        const qr = await QR.findOne({ qrid });
        const user = await User.findOne({ uid });

        if (!qr) throw new Error('QR not found');
        if (!user) throw new Error('User not found');

        // Check if the user is already a member
        if (!qr.members.includes(user._id)) {
            qr.members.push(user._id);
            await qr.save();
        }
        return qr;
    } catch (error) {
        console.error("Error adding member: ", error);
        throw error;
    }
};

// Remove a member from the QR
export const removeMemberFromQR = async (qrid, uid) => {
    try {
        const qr = await QR.findOne({ qrid });
        const user = await User.findOne({ uid });

        if (!qr) throw new Error('QR not found');
        if (!user) throw new Error('User not found');

        // Remove the user from members
        qr.members = qr.members.filter(memberId => !memberId.equals(user._id));
        await qr.save();
        return qr;
    } catch (error) {
        console.error("Error removing member: ", error);
        throw error;
    }
};
