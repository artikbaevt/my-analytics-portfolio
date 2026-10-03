export type Lang='en'|'ru'|'uz'; export type I18n={en:string;ru?:string;uz?:string};
export type Project={id:string;title:I18n;summary:I18n;tools:string[];domain:string;featured:boolean;published:boolean;impact:number;created_at:string;chart_data?:{data:Record<string,string|number>[];series:string[]};metrics?:{label:string;value:string}[]};
