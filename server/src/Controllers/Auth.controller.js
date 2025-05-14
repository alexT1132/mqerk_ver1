

export const register = async (req, res) => {
  const { correo, contraseña, role } = req.body;

  try {
    const userFound = await User.findOne({ correo });
    if (userFound) return res.status(400).json(["El correo ya esta en uso"]);

    const hash = await bcrypt.hash(contraseña, 10);

    const newUser = new User({
      nombre,
      puesto,
      no_trabajador,
      contraseña: hash,
      role,
    });

    const userSaved = await newUser.save();

    res.json({
      id: userSaved._id,
      nombre: userSaved.nombre,
      no_trabajador: userSaved.no_trabajador,
      role: userSaved.role,
    });
  } catch (error) {
    console.log(error);
  }
};