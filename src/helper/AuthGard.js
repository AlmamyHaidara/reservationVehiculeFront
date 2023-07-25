/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import router from '@/router';

export default function authGard(to) {
    console.log(to);
    let token = localStorage.getItem('userToken');
    if(to.name == "login"){
            if(token){
                return router.push('/')
            }
            return false
    }else if(to.name == "dashboard"){

        console.log();
        if (token) {
            return true;
        }
        return router.push('auth/login');
    }

}
