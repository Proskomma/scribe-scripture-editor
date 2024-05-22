import { useState } from 'react';
import { BooleanPicker } from './booleanPicker';
import { SelectPicker } from './SelectPicker';
import { InputPicker } from './InputPicker';
import { ScripturePicker } from './ScripturePicker';
import { ListPicker } from './ListPicker';
import { RessourcePicker } from './RessourcePicker';
import { IntPicker } from './IntPicker';
export function FieldPicker({
	fieldInfo,
	setJsonSpec,
	lang,
	open,
	listResourcesForPdf,
}) {
	let require = fieldInfo.nValues[0] > 0;
	if (fieldInfo.typeEnum) {
		if (1 === fieldInfo.nValues[1]) {
			return (
				<SelectPicker
					setJsonSpec={setJsonSpec}
					fieldInfo={fieldInfo}
					require={require}
					lang={lang}
					open={open}
				/>
			);
		} else {
			return (
				<ListPicker
					setJsonSpec={setJsonSpec}
					fieldInfo={fieldInfo}
					require={require}
					lang={lang}
					open={open}
				/>
			);
		}
	} else if (fieldInfo.typeName && fieldInfo.typeName === 'boolean') {
		return (
			<BooleanPicker
				setJsonSpec={setJsonSpec}
				fieldInfo={fieldInfo}
				require={require}
				lang={lang}
				open={open}
			/>
		);
	} else if (fieldInfo.typeName && fieldInfo.typeName === 'string') {
		return (
			<InputPicker
				setJsonSpec={setJsonSpec}
				fieldInfo={fieldInfo}
				require={require}
				lang={lang}
				open={open}
			/>
		);
	} else if (fieldInfo.id === 'scripture') {
		return (
			<ScripturePicker
				setJsonSpec={setJsonSpec}
				fieldInfo={fieldInfo}
				lang={lang}
				open={open}></ScripturePicker>
		);
	} else if (
		fieldInfo.typeName === 'translationText' ||
		fieldInfo.typeName === 'tNotes' ||
		fieldInfo.typeName === 'obs' ||
		fieldInfo.typeName === 'juxta' ||
		fieldInfo.typeName === 'md' ||
		fieldInfo.typeName === 'obsNotes' ||
		fieldInfo.typeName === 'html'
	) {
		return (
			<RessourcePicker
				setJsonSpec={setJsonSpec}
				fieldInfo={fieldInfo}
				ressourceKey={fieldInfo.typeName}
				require={require}
				open={open}
			/>
		);
	} else if (fieldInfo.typeName === 'integer') {
		return (
			<IntPicker
				setJsonSpec={setJsonSpec}
				fieldInfo={fieldInfo}
				lang={lang}
				open={open}
				require={require}
			/>
		);
	} else {
		return <div>{fieldInfo.id} : picker not found</div>;
	}
}