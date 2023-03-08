import {exec} from "child_process";


function execute(command) {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
}

execute("mkdir cert");
execute("mkcert -install");
execute("cd cert; mkcert localhost 127.0.0.1 ::1 cloudster.online *.cloudster.online; cd ..");

// run server
execute("npm run dev");
