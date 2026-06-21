export async function generatePlan(payload) {
    try {
        const response = await fetch("http://localhost:8000/api/plan", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to generate plan:", error);
        throw error;
    }
}

export async function getProfile(email) {
    const response = await fetch(`http://localhost:8000/api/profile?email=${encodeURIComponent(email)}`);

    if (!response.ok) {
        return null;
    }

    return await response.json();
}

export async function saveProfile(payload) {
    const response = await fetch("http://localhost:8000/api/profile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Profile error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

export async function requestLoginCode(email) {
    const response = await fetch("http://localhost:8000/api/auth/request-code", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Auth error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

export async function verifyLoginCode(email, code) {
    const response = await fetch("http://localhost:8000/api/auth/verify-code", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Auth error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}
