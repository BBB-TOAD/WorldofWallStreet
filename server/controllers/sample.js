if (!existingToken) {
  // Token does not exist
  // Store new Refresh Token in database
  const newRefreshToken = new RefreshToken({
    user_id: user.user_id,
    token: refreshToken,
  });
  // Save the new Refresh Token
  await newRefreshToken.save();
  res.status(200).json({
    message: "Authentication successful",
    accessToken,
    newRefreshToken,
  });
} else if (existingToken) {
  // Token exists
  // Change Token Value
  RefreshToken.update(
    { token: refreshToken },
    { where: { user_id: user.user_id } }
  )
    .then((updatedRows) => {
      if (updatedRows > 0) {
        console.log("Refresh token updated successfully");
        res.json({
          message: "Refresh token updated successfully",
          refreshToken,
        });
      } else {
        console.log("No matching record found for the given user_id");
        res.json({
          message: "No matching record found for the given user_id",
        });
      }
    })
    .catch((error) => {
      console.error("Error updating refresh token:", error);
      res.json({
        message: "Error updating refresh token:",
        error,
      });
    });
}
