export interface Version {
	version: string;
	version_type: string;
	date: string;
	major: boolean;
}

export interface ModLoader {
	name: string;
}

export type SnapshotsState = [boolean, (v: boolean) => void];
