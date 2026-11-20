export interface Version {
	version: string;
	version_type: string;
	date: string;
	major: boolean;
}

export interface ModLoader {
	name: string;
	supported_project_types: string[];
}

export type SnapshotsState = [boolean, (v: boolean) => void];
