package com.mania.token;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import com.google.appinventor.components.annotations.*;
import com.google.appinventor.components.common.ComponentCategory;
import com.google.appinventor.components.runtime.*;
import java.lang.reflect.Method;

@DesignerComponent(
        version = 1,
        description = "Native Google Sign-In Extension (Reflection based) for retrieving ID Token",
        category = ComponentCategory.EXTENSION,
        nonVisible = true,
        iconName = "https://end11.com/weekly/icon.png")
@SimpleObject(external = true)
@UsesPermissions(permissionNames = "android.permission.INTERNET")
public class Token extends AndroidNonvisibleComponent implements ActivityResultListener {

    private final Context context;
    private final Activity activity;
    private static final int RC_SIGN_IN = 9001;
    private Object mGoogleSignInClient;

    // Reflection Classes
    private Class<?> GoogleSignInOptionsClass;
    private Class<?> GoogleSignInClass;
    private Class<?> GoogleSignInAccountClass;
    private Class<?> ApiExceptionClass;
    private Class<?> TaskClass;

    public Token(ComponentContainer container){
        super(container.$form());
        this.activity = container.$context();
        this.context = container.$context();
        container.$form().registerForActivityResult(this);
    }

    @SimpleFunction(description = "Initiates Google Sign-In to get the ID Token. Pass the Web Client ID.")
    public void SignIn(String webClientId) {
        try {
            // Load Classes via Reflection
            GoogleSignInOptionsClass = Class.forName("com.google.android.gms.auth.api.signin.GoogleSignInOptions");
            GoogleSignInClass = Class.forName("com.google.android.gms.auth.api.signin.GoogleSignIn");
            GoogleSignInAccountClass = Class.forName("com.google.android.gms.auth.api.signin.GoogleSignInAccount");
            try {
                ApiExceptionClass = Class.forName("com.google.android.gms.common.api.ApiException");
            } catch (ClassNotFoundException e) {
                // Try alternate package if needed, or handle generically
            }
            TaskClass = Class.forName("com.google.android.gms.tasks.Task");

            // Builder: new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            Object defaultSignIn = GoogleSignInOptionsClass.getField("DEFAULT_SIGN_IN").get(null);
            Class<?> builderClass = Class.forName("com.google.android.gms.auth.api.signin.GoogleSignInOptions$Builder");
            Object builder = builderClass.getConstructor(GoogleSignInOptionsClass).newInstance(defaultSignIn);

            // .requestIdToken(webClientId)
            Method requestIdTokenMethod = builderClass.getMethod("requestIdToken", String.class);
            builder = requestIdTokenMethod.invoke(builder, webClientId);

            // .requestEmail()
            Method requestEmailMethod = builderClass.getMethod("requestEmail");
            builder = requestEmailMethod.invoke(builder);

            // .build()
            Method buildMethod = builderClass.getMethod("build");
            Object gso = buildMethod.invoke(builder);

            // GoogleSignIn.getClient(activity, gso)
            Method getClientMethod = GoogleSignInClass.getMethod("getClient", Activity.class, GoogleSignInOptionsClass);
            mGoogleSignInClient = getClientMethod.invoke(null, activity, gso);

            // mGoogleSignInClient.getSignInIntent()
            Method getSignInIntentMethod = mGoogleSignInClient.getClass().getMethod("getSignInIntent");
            Intent signInIntent = (Intent) getSignInIntentMethod.invoke(mGoogleSignInClient);

            activity.startActivityForResult(signInIntent, RC_SIGN_IN);

        } catch (Exception e) {
            Log.e("TokenExtension", "Reflection Init Error", e);
            LoginError("Init Error: " + e.toString());
        }
    }

    @SimpleEvent(description = "Triggered when login is successful. Returns the ID Token.")
    public void LoginSuccess(String idToken, String email, String displayName, String photoUrl) {
        EventDispatcher.dispatchEvent(this, "LoginSuccess", idToken, email, displayName, photoUrl);
    }

    @SimpleEvent(description = "Triggered when login fails.")
    public void LoginError(String errorMessage) {
        EventDispatcher.dispatchEvent(this, "LoginError", errorMessage);
    }

    @SimpleEvent(description = "Debug messages for troubleshooting.")
    public void Debug(String message) {
        EventDispatcher.dispatchEvent(this, "Debug", message);
    }

    @Override
    public void resultReturned(int requestCode, int resultCode, Intent data) {
        Debug("resultReturned: req=" + requestCode + " res=" + resultCode);
        if (requestCode == RC_SIGN_IN) {
            try {
                Debug("Processing Sign-In Result...");
                // GoogleSignIn.getSignedInAccountFromIntent(data)
                Method getSignedInAccountMethod = GoogleSignInClass.getMethod("getSignedInAccountFromIntent", Intent.class);
                Object task = getSignedInAccountMethod.invoke(null, data);
                
                if (task == null) {
                    Debug("Error: Task is null");
                    return;
                }
                
                handleSignInResult(task);
            } catch (Exception e) {
                 LoginError("Result Error: " + e.toString());
                 Debug("Exception in resultReturned: " + e.toString());
            }
        }
    }

    private void handleSignInResult(Object completedTask) {
        try {
            Debug("Handling Task Result...");
            // task.getResult(ApiException.class)
            Method getResultMethod = TaskClass.getMethod("getResult", Class.class);
            Object account = getResultMethod.invoke(completedTask, ApiExceptionClass);

            if (account != null) {
                Debug("Account retrieved successfully.");
                // Get getters
                Method getIdTokenMethod = GoogleSignInAccountClass.getMethod("getIdToken");
                Method getEmailMethod = GoogleSignInAccountClass.getMethod("getEmail");
                Method getDisplayNameMethod = GoogleSignInAccountClass.getMethod("getDisplayName");
                Method getPhotoUrlMethod = GoogleSignInAccountClass.getMethod("getPhotoUrl");

                String idToken = (String) getIdTokenMethod.invoke(account);
                String email = (String) getEmailMethod.invoke(account);
                String displayName = (String) getDisplayNameMethod.invoke(account);
                Object photoUri = getPhotoUrlMethod.invoke(account);
                String photoUrl = photoUri != null ? photoUri.toString() : "";

                Debug("Token retrieved: " + (idToken != null ? "Yes" : "No"));
                LoginSuccess(idToken, email, displayName, photoUrl);
            } else {
                LoginError("Account is null");
                Debug("Error: Account object is null");
            }
        } catch (Exception e) {
            // Check for ApiException invocation target exception
            if (e.getCause() != null && e.getCause().getClass().getName().contains("ApiException")) {
                 String msg = e.getCause().getMessage();
                 LoginError("Sign-in failed (ApiException): " + msg);
                 Debug("ApiException: " + msg);
            } else {
                 LoginError("Result Parse Error: " + e.toString());
                 Debug("Exception in handleSignInResult: " + e.toString());
            }
        }
    }
}
