// ✅ تحميل Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAdf5AKFgLXgK2PYERHw1hgF_HsMmuTfuo",
    authDomain: "noproblem-55b97.firebaseapp.com",
    projectId: "noproblem-55b97",
    storageBucket: "noproblem-55b97.firebasestorage.app",
    messagingSenderId: "316010224446",
    appId: "1:316010224446:web:5d7e7f792e53ee4b396a6f",
    measurementId: "G-VKSGWBRKVL"
};

// ✅ التأكد من عدم تهيئة Firebase أكثر من مرة
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// ✅ إنشاء حساب جديد مع إرسال رابط التحقق وانتظار 9 ثوانٍ قبل التوجيه
function signUp() {
    let username = document.getElementById("username").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            let user = userCredential.user;

            // ✅ إرسال رابط التحقق
            user.sendEmailVerification().then(() => {
                Swal.fire({
                    title: "✅ تحقق من بريدك!",
                    text: "تم إرسال رابط التحقق إلى بريدك الإلكتروني. يرجى تأكيد الحساب.",
                    icon: "info",
                    timer: 9000, // ⏳ انتظر 9 ثوانٍ
                    showConfirmButton: false
                });

                // ✅ حفظ بيانات المستخدم في Firestore
                db.collection("users").doc(user.uid).set({
                    username: username,
                    email: email,
                    password: password,
                    wallet: 0
                }).then(() => {
                    setTimeout(() => {
                        window.location.href = "login.html"; // ✅ التوجيه بعد 9 ثوانٍ
                    }, 9000);
                });
            }).catch((error) => {
                console.error("❌ خطأ في إرسال التحقق:", error);
                Swal.fire("❌ خطأ", "حدث خطأ أثناء إرسال رابط التحقق.", "error");
            });
        })
        .catch((error) => {
            Swal.fire("❌ خطأ", error.message, "error");
        });
}


// ✅ دالة تسجيل الدخول مع التحقق من البريد
function login() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            let user = userCredential.user;

            // ✅ التحقق مما إذا كان البريد الإلكتروني مفعل
            if (!user.emailVerified) {
                Swal.fire("❌ حساب غير مفعل!", "يرجى التحقق من بريدك الإلكتروني قبل تسجيل الدخول.", "warning");
                firebase.auth().signOut();
                return;
            }

            Swal.fire("✅ تم تسجيل الدخول!", "مرحبًا بك!", "success");
            window.location.href = "profile.html";
        })
        .catch((error) => {
            Swal.fire("❌ خطأ", error.message, "error");
        });
}

// ✅ دالة إعادة إرسال رابط التحقق
function resendVerification() {
    let email = document.getElementById("email").value;

    if (!email) {
        Swal.fire("⚠️ أدخل بريدك الإلكتروني أولاً!", "يرجى إدخال بريدك الإلكتروني لإعادة إرسال رابط التحقق.", "info");
        return;
    }

    firebase.auth().signInWithEmailAndPassword(email, "wrong-password")
        .then(() => {})
        .catch((error) => {
            if (error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
                Swal.fire("❌ خطأ", "البريد الإلكتروني غير صحيح أو غير مسجل.", "error");
            } else {
                firebase.auth().fetchSignInMethodsForEmail(email)
                    .then((methods) => {
                        if (methods.length > 0) {
                            firebase.auth().currentUser.sendEmailVerification()
                                .then(() => {
                                    Swal.fire("✅ تم إرسال التحقق!", "تحقق من بريدك الإلكتروني.", "success");
                                })
                                .catch(() => {
                                    Swal.fire("❌ خطأ", "لم نتمكن من إرسال البريد. حاول مرة أخرى لاحقًا.", "error");
                                });
                        } else {
                            Swal.fire("❌ خطأ", "هذا البريد غير مسجل لدينا.", "error");
                        }
                    });
            }
        });
}
