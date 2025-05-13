import {Injectable} from '@angular/core';
import { createInstance, Environment } from "@loomhq/record-sdk";
import { isSupported } from "@loomhq/record-sdk/is-supported";
import { oembed } from "@loomhq/loom-embed";

const PUBLIC_APP_ID = "8d86fcac-e54c-49a4-92e0-e953a478690b";
const BUTTON_ID = "loom-record-sdk-button";


@Injectable({
  providedIn: 'root'
})
export class LoomService {

  constructor(
    
  ) {
    this.init();
  }

    insertEmbedPlayer(html: string) {
        const target = document.getElementById("target");
    
        if (target) {
            target.innerHTML = html;
        }
    }
  
    async init() {
        console.log("Initializing Loom");
        const { supported, error } = await isSupported();
    
        if (!supported) {
            console.warn(`Error setting up Loom: ${error}`);
            return;
        }
    
        const root = document.getElementById("app");
    
        if (!root) {
            return;
        }
    
        root.innerHTML = `<button id="${BUTTON_ID}">Record</button>`;
    
        const button = document.getElementById(BUTTON_ID);

        console.log(button);
    
        if (!button) {
            return;
        }

        console.log("start");

        const instance = await createInstance({
            mode: "standard",
            publicAppId: PUBLIC_APP_ID,
            // environment: Environment.Production,
            config: { insertButtonText: "hello world" }
        });

        console.log("end");

        console.log(instance);
        console.log(instance.status())

        // instance.configureButton({ element: button });
    
        // const { configureButton } = await createInstance({
        //     mode: 'standard',
        //     publicAppId: PUBLIC_APP_ID,
        //     environment: Environment.Development,
        //     // config?: SDKConfig
        // });
    
        const sdkButton = instance.configureButton({ element: button });
    
        sdkButton.on("insert-click", async (video) => {
            const { html } = await oembed(video.sharedUrl, { width: 400 });
            this.insertEmbedPlayer(html);
        });
    }
  
}
