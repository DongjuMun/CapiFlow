exports.get_login = async (req, res, nxt) => {
    try {
        res.render('login');
    } catch (error) {
        res.status(500).send("Error loading login");
    }
}
