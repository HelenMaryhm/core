export interface DotTheme {
    identifier: string;
    name: string;
    title: string;
    inode: string;
    themeThumbnail: string;
    hostId: string;
    host: {
        hostName: string;
        inode: string;
        identifier: string;
    };
    defaultFileType?: string;
    filesMasks?: string;
    modDate?: number;
    path?: string;
    sortOrder?: number;
    showOnMenu?: boolean;
    type?: string;
}
