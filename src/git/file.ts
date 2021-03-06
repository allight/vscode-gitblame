import { Uri, window, workspace } from "vscode";

import { TIME_CACHE_LIFETIME } from "../constants";
import { IGitBlameInfo } from "../interfaces";
import { ErrorHandler } from "../util/errorhandler";
import { GitBlame } from "./blame";

export class GitFile {
    public readonly fileName: Uri;
    public disposeCallback: () => void;

    private cacheClearInterval: NodeJS.Timer | undefined;

    constructor(fileName: string, disposeCallback: () => void) {
        this.fileName = Uri.file(fileName);
        this.disposeCallback = disposeCallback;
    }

    public startCacheInterval(): void {
        this.clearCacheInterval();

        this.cacheClearInterval = setInterval(() => {
            const isOpen = window.visibleTextEditors.some(
                (editor) => editor.document.uri.fsPath === this.fileName.fsPath,
            );

            if (!isOpen) {
                ErrorHandler.logInfo(
                    `Clearing the file "${
                        this.fileName.fsPath
                    }" from the internal cache`,
                );
                this.dispose();
            }
        }, TIME_CACHE_LIFETIME);
    }

    public async blame(): Promise<IGitBlameInfo> {
        return GitBlame.blankBlameInfo();
    }

    public dispose(): void {
        this.clearCacheInterval();

        this.disposeCallback();
        delete this.disposeCallback;
    }

    private clearCacheInterval(): void {
        if (typeof this.cacheClearInterval !== "undefined") {
            clearInterval(this.cacheClearInterval);
        }
    }
}
