# 🛤️ User Registration & OTP Activity Flow

This diagram visualizes the multi-step verification process for new users, ensuring data integrity and account security.

```mermaid
stateDiagram-v2
    state "Access Portal" as Access
    state "Submit Registration" as Submit
    state "Process Verification" as Verify
    state "Identity Confirmation" as Identity
    state "Profile Completion" as Profile
    state "Active User" as Active

    [*] --> Access
    Access --> Submit: User provides Email/Phone
    
    Submit --> Verify: API generates 6-digit OTP
    
    state Verify {
        direction LR
        QueueJob --> SMSWorker: Trigger Twilio
        QueueJob --> MailWorker: Trigger MailHog/SMTP
    }
    
    Verify --> Identity: Notification Dispatched
    
    Identity --> CheckValid: User enters code
    
    state CheckValid <<choice>>
    CheckValid --> Identity: Invalid/Expired (Return Error)
    CheckValid --> Profile: Valid code entered
    
    Profile --> SubmitProfile: User provides Governorate, DOB
    
    SubmitProfile --> Active: Mark User as Verified
    Active --> [*]: Issue JWT & Refresh Token
```

### ⚙️ Operational Logic
- **Worker Redundancy**: If a user registers with a phone number, the `SMSWorker` is prioritized. If email, the `MailWorker` handles delivery.
- **State Persistence**: The OTP is stored with an `expiresAt` timestamp in PostgreSQL, checked atomically during the `VerifyOTP` call.
- **Graceful Failure**: If background workers are down, the job remains in Redis, ensuring the user eventually receives their code.
