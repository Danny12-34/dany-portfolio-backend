const supabase = require('../config/db');

// ==========================================
// 1. READ ALL (Fetch all projects and experiences)
// ==========================================
exports.getPortfolioData = async (req, res) => {
    try {
        const [projectsData, experienceData] = await Promise.all([
            supabase.from('projects').select('*').order('id', { ascending: true }),
            supabase.from('experience').select('*').order('id', { ascending: true })
        ]);

        if (projectsData.error) throw projectsData.error;
        if (experienceData.error) throw experienceData.error;

        return res.status(200).json({
            success: true,
            data: {
                projects: projectsData.data,
                experience: experienceData.data
            }
        });
    } catch (error) {
        console.error('Fetch Exception:', error.message);
        return res.status(500).json({ success: false, message: 'Server Error fetching data', error: error.message });
    }
};

// ==========================================
// 2. CREATE OPERATIONS
// ==========================================
exports.createProject = async (req, res) => {
    try {
        const { title, category, technologies, features, github_url, live_url } = req.body;
        
        const { data, error } = await supabase
            .from('projects')
            .insert([{ title, category, technologies, features, github_url, live_url }])
            .select();

        if (error) throw error;
        return res.status(201).json({ success: true, message: 'Project created successfully', data: data[0] });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

exports.createExperience = async (req, res) => {
    try {
        const { role, organization, duration, responsibilities, achievements } = req.body;

        const { data, error } = await supabase
            .from('experience')
            .insert([{ role, organization, duration, responsibilities, achievements }])
            .select();

        if (error) throw error;
        return res.status(201).json({ success: true, message: 'Experience record created successfully', data: data[0] });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

// ==========================================
// 3. UPDATE OPERATIONS
// ==========================================
exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ success: false, message: 'Project record not found' });

        return res.status(200).json({ success: true, message: 'Project record updated successfully', data: data[0] });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

exports.updateExperience = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('experience')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ success: false, message: 'Experience record not found' });

        return res.status(200).json({ success: true, message: 'Experience record updated successfully', data: data[0] });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

// ==========================================
// 4. DELETE OPERATIONS
// ==========================================
exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ success: false, message: 'Project record not found' });

        return res.status(200).json({ success: true, message: 'Project record deleted successfully' });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

exports.deleteExperience = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('experience')
            .delete()
            .eq('id', id)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ success: false, message: 'Experience record not found' });

        return res.status(200).json({ success: true, message: 'Experience record deleted successfully' });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};