const supabase = require('../config/supabase');

// ================= GET ALL SKILLS =================
exports.getAllSkills = async (req, res) => {
    const { data, error } = await supabase.from('skills').select('*');
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

// ================= GET USER SKILLS =================
exports.getUserSkills = async (req, res) => {
    const userId = req.params.id;

    const { data, error } = await supabase
        .from('user_skills')
        .select(`skills(id, name)`)
        .eq('user_id', userId);

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
};

// ================= UPDATE SKILLS =================
exports.updateUserSkills = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skills } = req.body;

        // delete old
        await supabase.from('user_skills').delete().eq('user_id', userId);

        // insert new
        const newSkills = skills.map(skill_id => ({
            user_id: userId,
            skill_id
        }));

        const { data, error } = await supabase
            .from('user_skills')
            .insert(newSkills);

        if (error) return res.status(400).json({ error: error.message });

        res.json({ message: 'Skills updated successfully', data });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ================= ADD SKILLS (اختياري) =================
exports.addUserSkills = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skills } = req.body;

        const rows = skills.map(skill_id => ({
            user_id: userId,
            skill_id
        }));

        const { data, error } = await supabase
            .from('user_skills')
            .insert(rows);

        if (error) return res.status(400).json({ error: error.message });

        res.json({ message: 'Skills added', data });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ================= DELETE SKILLS =================
exports.deleteUserSkill = async (req, res) => {
    try {
        const userId = req.user.id;

        const { error } = await supabase
            .from('user_skills')
            .delete()
            .eq('user_id', userId);

        if (error) return res.status(400).json({ error: error.message });

        res.json({ message: 'Skills deleted' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};