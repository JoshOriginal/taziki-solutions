<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON header for consistent response
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $name = strip_tags(trim($_POST["name"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $company = strip_tags(trim($_POST["company"]));
    $website_type = strip_tags(trim($_POST["website-type"]));
    $message = trim($_POST["message"]);
    
    // Validate data
    if (empty($name) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Please complete all required fields and provide a valid email address."]);
        exit;
    }

    try {
        // Create PHPMailer instance
        $mail = new PHPMailer(true);
        
        // Server settings for Gmail
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'your-email@gmail.com'; // Replace with your Gmail
        $mail->Password = 'your-app-password'; // Replace with Gmail app password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->Timeout = 30; // 30 second timeout
        
        // Debug mode (remove in production)
        // $mail->SMTPDebug = 2; 
        // $mail->Debugoutput = 'error_log';

        // Email to admin (Taziki Solutions)
        $mail->setFrom('your-email@gmail.com', 'Taziki Solutions Website'); // Use your domain email if possible
        $mail->addAddress('info@tazikisolutions.com', 'Taziki Solutions');
        $mail->addReplyTo($email, $name);
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = "New Website Development Inquiry from $name";
        
        $mail->Body = "
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #F97316; color: white; padding: 20px; text-align: center; }
                    .content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .field { margin-bottom: 10px; }
                    .field strong { color: #F97316; }
                    .message-box { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #F97316; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h2>New Website Development Inquiry</h2>
                    </div>
                    <div class='content'>
                        <div class='field'><strong>Name:</strong> $name</div>
                        <div class='field'><strong>Email:</strong> $email</div>
                        <div class='field'><strong>Company:</strong> " . ($company ?: 'Not provided') . "</div>
                        <div class='field'><strong>Website Type:</strong> " . ($website_type ?: 'Not specified') . "</div>
                        <div class='field'><strong>Message:</strong></div>
                        <div class='message-box'>" . nl2br(htmlspecialchars($message)) . "</div>
                    </div>
                    <p style='color: #666; font-size: 12px;'>
                        This message was sent from your website contact form at tazikisolutions.com
                    </p>
                </div>
            </body>
            </html>
        ";
        
        $mail->AltBody = "
            New Website Development Inquiry\n
            Name: $name\n
            Email: $email\n
            Company: " . ($company ?: 'Not provided') . "\n
            Website Type: " . ($website_type ?: 'Not specified') . "\n\n
            Message:\n$message\n
        ";

        // Send email to admin
        $mail->send();
        
        // Send confirmation email to user
        $userMail = new PHPMailer(true);
        $userMail->isSMTP();
        $userMail->Host = 'smtp.gmail.com';
        $userMail->SMTPAuth = true;
        $userMail->Username = 'your-email@gmail.com'; // Same as above
        $userMail->Password = 'your-app-password'; // Same as above
        $userMail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $userMail->Port = 587;
        
        $userMail->setFrom('your-email@gmail.com', 'Taziki Solutions');
        $userMail->addAddress($email, $name);
        
        $userMail->isHTML(true);
        $userMail->Subject = "We Received Your Website Development Inquiry";
        
        $userMail->Body = "
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #F97316; color: white; padding: 20px; text-align: center; }
                    .content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .footer { border-top: 2px solid #F97316; padding-top: 20px; margin-top: 30px; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h2>Thank You for Your Inquiry!</h2>
                    </div>
                    <p>Hi $name,</p>
                    <p>We have received your website development inquiry and will get back to you within 24 hours.</p>
                    
                    <div class='content'>
                        <h3>Your Inquiry Details:</h3>
                        <p><strong>Company:</strong> " . ($company ?: 'Not provided') . "</p>
                        <p><strong>Website Type:</strong> " . ($website_type ?: 'Not specified') . "</p>
                        <p><strong>Your Message:</strong></p>
                        <p style='background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #16A34A;'>
                            " . nl2br(htmlspecialchars($message)) . "
                        </p>
                    </div>
                    
                    <div class='footer'>
                        <p><strong>Taziki Solutions Team</strong></p>
                        <p>Email: info@tazikisolutions.com</p>
                        <p>Phone: +254 714 294 223</p>
                        <p>Nairobi, Kenya</p>
                    </div>
                </div>
            </body>
            </html>
        ";
        
        $userMail->AltBody = "
            Thank You for Your Inquiry!\n\n
            Hi $name,\n\n
            We have received your website development inquiry and will get back to you within 24 hours.\n\n
            Your Inquiry Details:\n
            Company: " . ($company ?: 'Not provided') . "\n
            Website Type: " . ($website_type ?: 'Not specified') . "\n
            Your Message:\n$message\n\n
            Taziki Solutions Team\n
            Email: info@tazikisolutions.com\n
            Phone: +254 714 294 223\n
            Nairobi, Kenya
        ";
        
        $userMail->send();

        // Success response
        http_response_code(200);
        echo json_encode([
            "success" => true, 
            "message" => "Thank You! Your message has been sent successfully. We will get back to you within 24 hours."
        ]);

    } catch (Exception $e) {
        // Log the error
        error_log("Email error: " . $e->getMessage());
        
        http_response_code(500);
        echo json_encode([
            "success" => false, 
            "error" => "Oops! Something went wrong and we couldn't send your message. Please try again later or contact us directly at info@tazikisolutions.com"
        ]);
    }

} else {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
}
?>