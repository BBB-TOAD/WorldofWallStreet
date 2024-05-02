// Logic to generate new refresh token
const refreshToken = req.body.refreshToken;
const user_id = req.user_id;

if (refreshToken == null)
  return res.status(401).json({ message: "no Refresh Token found" });

existingToken = await checkRefreshToken(user_id, refreshToken);

if (!existingToken) {
  // Token does not exist
  res.status(403).json({ message: "Token does not exist" });
}

jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET, (err, user) => {
  if (err) return send.status(403).json({ message: "JWT Verification Failed" });
  accessToken = generateAccessToken({
    user_id: user.user_id,
    user_email: user.email,
  });
  res.json({ accessToken: accessToken });
});
