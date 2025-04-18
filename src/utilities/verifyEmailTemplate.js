const verifyEmailTemplate = ({username, url}) => {
    return `
    <div style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif;">
      <div style="background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #007BFF; margin-bottom: 20px;">Hello ${username}</h1>
            <p>Thank You for Contacting Fresh Katale</p>
                <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
            <a href="${url}" style="background-color: #007BFF; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px;">Verify Email</a>
        </div>
    </div>`
}

export default verifyEmailTemplate