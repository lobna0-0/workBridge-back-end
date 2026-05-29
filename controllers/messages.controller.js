const Message = require('../models/messages.model');
const supabase = require('../config/supabase');
const messageSchema = require('../validations/message.validation');
const { getIO } = require('../socket');
const { sendNotification } = require('../service/notifications.service');

// ======================
//  CREATE MESSAGE
// ======================
exports.createMessage = async (req, res) => {
    try {

        const { project_id, content } = req.body;

        if (!project_id || !content) {
            return res.status(400).json({
                message: "Missing fields"
            });
        }

        const { data: project } = await supabase
            .from('projects')
            .select('client_id, freelancer_id')
            .eq('id', project_id)
            .single();

        const finalReceiver =
            project.client_id === req.user.id
                ? project.freelancer_id
                : project.client_id;

        const messageData = {
            project_id: Number(project_id),
            sender_id: req.user.id,
            receiver_id: finalReceiver,
            content
        };

        const newMessage = await Message.createMessage(messageData);

        // ✅ get full sender info
        const fullMessage = await Message.getMessageById(newMessage.id);

        const io = getIO();

        // ✅ realtime chat
        io.to(`project_${project_id}`).emit(
            'receive_message',
            fullMessage
        );

        const notificationResult = await sendNotification(finalReceiver, {
            type: 'message',
            title: 'New Message',
            message: content,
            project_id: Number(project_id),
            sender_id: req.user.id,
            sender_name:
            fullMessage?.sender?.name ||
            req.user?.name ||
            'User',
            event_key: `message_created:${newMessage.id}:user:${finalReceiver}`
        });

        if (notificationResult?.error) {
            console.error('[messages.controller] sendNotification error:', notificationResult.error);
        }

        return res.status(201).json(fullMessage);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

exports.getMessageByProjectId = async (req, res) => {
    try {

        const projectId = req.params.projectId;

        const messages = await Message.getMessageByProjectId(projectId);

        return res.status(200).json(messages);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateMessage = async (req, res) => {
    try {

        const message = await Message.getMessageById(req.params.id);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        if (message.sender_id !== req.user.id) {
            return res.status(403).json({ error: "Not your message" });
        }

        const updatedMessage = await Message.updateMessage(
            req.params.id,
            req.body
        );

        //  realtime update
        const io = getIO();

        io.to(`project_${message.project_id}`).emit('message_updated', {
            id: req.params.id,
            ...req.body
        });

        res.status(200).json(updatedMessage);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteMessage = async (req, res) => {
    try {

        const message = await Message.getMessageById(req.params.id);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        if (message.sender_id !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ error: "Not allowed" });
        }

        await Message.deleteMessage(req.params.id);

        // 🔥 realtime delete
        const io = getIO();

        io.to(`project_${message.project_id}`).emit('message_deleted', {
            id: req.params.id
        });

        res.status(200).json({ message: 'Message deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
