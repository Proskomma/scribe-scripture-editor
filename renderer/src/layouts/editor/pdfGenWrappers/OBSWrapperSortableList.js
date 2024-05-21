import { useEffect, useState, useContext } from 'react';
import { Button, Modal } from '@material-ui/core';
import { AccordionPicker } from '../fieldPicker/AccordionPicker';
import i18n from 'src/translations/i18n';
import { ProjectContext } from '@/components/context/ProjectContext';
import SelectBook from '@/components/EditorPage/Navigation/reference/SelectBook';
import { useBibleReference } from 'bible-reference-rcl';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import Switch from '@material-ui/core/Switch';
import { alpha, styled } from '@material-ui/core/styles';
import { NumericFormat } from 'react-number-format';
import { TextField } from '@mui/material';
import Trash from './../../../../../public/icons/trash.svg';
import ImageIcon from '../../../../../public/icons/basil/Solid/Files/Image.svg';

import React from 'react';
const LoopSwitch = styled(Switch)(({ theme }) => ({
	'& .MuiSwitch-switchBase.Mui-checked': {
		color: '#FF5500',
		'&:hover': {
			backgroundColor: alpha(
				'#FF5500',
				theme.palette.action.hoverOpacity,
			),
		},
	},
	'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
		backgroundColor: '#FF5500',
	},
}));

export function OBSWrapperSortableList({
	setFinalPrint,
	wrapperType,
	keyWrapper,
	setUpdate,
	advanceMode,
	changePrintData,
	changePrintOrder,
}) {
	const choice = require('../fieldPicker/specification/WrapperSection.json');
	const listChoice = choice[wrapperType];
	const initialBook = 'mat';
	const initialChapter = '1';
	const initialVerse = '1';

	const { t } = useTranslation();

	const {
		state: { bookList },
	} = useBibleReference({
		initialBook,
		initialChapter,
		initialVerse,
	});
	const {
		states: { language, canonList },
		actions: { setLanguage },
	} = useContext(ProjectContext);

	const NumericFormatCustom = React.forwardRef(function NumericFormatCustom(
		props,
		ref,
	) {
		const { onChange, ...other } = props;

		return (
			<NumericFormat
				{...other}
				getInputRef={ref}
				onChange={(values) => {
					onChange({
						target: {
							name: props.name,
							value: values.value,
						},
					});
				}}
			/>
		);
	});

	setLanguage('fr');
	const [openModal, setOpenModal] = useState(false);
	const [orderSelection, setOrderSelection] = useState([0]);
	const [selected, setSelected] = useState(
		'{"0": { "type": "obs", "content": {} }}',
	);
	const [startObs, setStartObs] = useState('');
	const [endObs, setEndObs] = useState('');

	const [LoopMode, setLoopMode] = useState(false);

	const sortableListClassName = `sortable-${keyWrapper}-list`;
	const itemClassName = `sortable-${keyWrapper}-item`;

	const handleBlurStart = (event) => {
		const newValue = event.target.value.trim(); // Trim any whitespace
		setStartObs(newValue);
	};
	const handleBlurEnd = (event) => {
		const newValue = event.target.value.trim(); // Trim any whitespace
		setEndObs(newValue);
	};

	useEffect(() => {
		setFinalPrint((prev) => {
			const t = { ...prev };
			t[keyWrapper].content.order = orderSelection;
			return t;
		});
	}, [orderSelection]);
	useEffect(() => {
		setFinalPrint((prev) => {
			const t = { ...prev };
			t[keyWrapper].content.content = JSON.parse(selected);
			return t;
		});
	}, [selected]);

	useEffect(() => {
		changePrintData((prev) => {
			const copyData = { ...prev };
			if (startObs !== '' && endObs !== '') {
				if (parseInt(startObs) <= parseInt(endObs)) {
					copyData[keyWrapper][
						'storyRange'
					] = `${startObs}-${endObs}`;
				}
			}
			console.log(copyData);
			return copyData;
		});
	}, [startObs, endObs]);
	useEffect(() => {
		const sortableList = document.querySelector(
			`.${sortableListClassName}`,
		);
		const items = sortableList.querySelectorAll(`.${itemClassName}`);
		items.forEach((item) => {
			item.addEventListener('dragstart', () => {
				setTimeout(() => item.classList.add('dragging'), 0);
			});
			item.addEventListener('dragend', () => {
				item.classList.remove('dragging');
			});
		});

		const initSortableList = (e) => {
			e.preventDefault();
			e.stopPropagation();

			const draggingItem = document.querySelector(
				`.${itemClassName}.dragging`,
			);
			if (!draggingItem) {
				return;
			}
			let siblings = [
				...sortableList.querySelectorAll(
					`.${itemClassName}:not(.dragging)`,
				),
			];
			let nextSibling = siblings.find((sibling) => {
				return e.clientY <= sibling.offsetTop + sibling.offsetHeight;
			});
			sortableList.insertBefore(draggingItem, nextSibling);
		};

		sortableList.addEventListener('dragend', () =>
			updateElemOrder(sortableList.querySelectorAll(`.${itemClassName}`)),
		);
		sortableList.addEventListener('dragover', initSortableList);
		sortableList.addEventListener('dragenter', (e) => e.preventDefault());

		return () => {
			sortableList.removeEventListener('dragover', initSortableList);
			items.forEach((item) => {
				item.removeEventListener('dragstart', () => {
					setTimeout(() => item.classList.add('dragging'), 0);
				});
				item.removeEventListener('dragend', () => {
					item.classList.remove('dragging');
					updateElemOrder();
				});
			});
		};
	}, [Object.keys(JSON.parse(selected)).length]);

	const updateElemOrder = (items) => {
		const t = [];
		items.forEach((item) => {
			t.push(parseInt(item.id));
		});
		setOrderSelection(t);
	};
	const handleOpenModal = (isOpen) => {
		setOpenModal(isOpen);
	};
	return (
		<div
			style={
				LoopMode
					? {
							width: '100%',
							borderStyle: 'solid',
							borderColor: '#EEEEEE',
							borderWidth: 1,
							backgroundColor: '#FFEEE5',
							padding: 15,
							borderRadius: 10,
					  }
					: {
							width: '100%',
							borderStyle: 'solid',
							borderColor: '#EEEEEE',
							borderWidth: 1,
							backgroundColor: '#FCFAFA',
							padding: 15,
							borderRadius: 10,
					  }
			}>
			<div style={{ display: 'flex', justifyContent: 'end' }}>
				{advanceMode ? (
					<div>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								color: 'black',
							}}>
							loop
						</div>
						<LoopSwitch
							onChange={() => setLoopMode((prev) => !prev)}
						/>
					</div>
				) : (
					<></>
				)}

				<div
					style={{
						margin: 'auto',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center', // Added alignment to center vertically
						fontSize: 24,
						color: 'black',
					}}>
					<div style={{ width: 35, height: 35, marginRight: 8 }}>
						<ImageIcon />
					</div>
					Obs
				</div>
				{advanceMode ? (
					<div style={{ display: 'flex' }}>
						<Button
							style={{
								borderStyle: 'solid',
								color: 'white',
							}}
							onClick={() => {
								changePrintOrder((prev) => {
									let t = [...prev];
									console.log(t);
									t.splice(t.indexOf(keyWrapper), 1);
									for (let i = 0; i < t.length; i++) {
										if (t[i] > keyWrapper) {
											t[i] -= 1;
										}
									}
									return t;
								});
								changePrintData((prev) => {
									console.log(prev);
									const updatedSelected = {
										...prev,
									};
									const up = {};

									Object.keys(updatedSelected).forEach(
										(key) => {
											console.log(key);
											if (parseInt(key) > keyWrapper) {
												let newIndex =
													parseInt(key) - 1;
												up[newIndex] =
													updatedSelected[key];
											} else if (
												parseInt(key) < keyWrapper
											) {
												up[key] = updatedSelected[key];
											}
										},
									);
									console.log(up);
									return up;
								});
							}}>
							<Trash style={{ height: 35, width: 35 }} />
						</Button>
					</div>
				) : (
					<></>
				)}
			</div>
			{advanceMode ? (
				<div
					style={{
						justifyContent: 'space-between',
						display: 'flex',
					}}>
					<TextField
						label={'obs start'}
						value={startObs}
						onBlur={handleBlurStart}
						id='formatted-numberformat-input'
						InputProps={{
							inputComponent: NumericFormatCustom,
						}}
						variant='standard'
					/>
					<TextField
						label={'obs end'}
						value={endObs}
						onBlur={handleBlurEnd}
						id='formatted-numberformat-input'
						InputProps={{
							inputComponent: NumericFormatCustom,
						}}
						variant='standard'
					/>
				</div>
			) : (
				<></>
			)}
			<ul className={sortableListClassName}>
				{Object.keys(JSON.parse(selected)).map((k, index) => (
					<li
						id={index}
						className={itemClassName}
						draggable='true'
						key={k + '_' + index}
						onDragStart={() => setUpdate(false)}
						onDragEnd={() => setUpdate(true)}
						style={{ padding: 5 }}>
						<div style={{ flexDirection: 'row', display: 'flex' }}>
							<AccordionPicker
								language={i18n.language}
								wrapperType={wrapperType}
								advanceMode={advanceMode}
								setSelected={setSelected}
								keySpecification={JSON.parse(selected)[k].type}
								idjson={k}
								removeButton={
									advanceMode ? (
										<Button
											style={{
												borderRadius: 4,
												height: 40,
												backgroundColor: '#F50',
												borderStyle: 'solid',
												borderColor: '#F50',
												color: 'white',
											}}
											onClick={() => {
												setOrderSelection((prev) => {
													let t = [...prev];
													t.splice(
														t.indexOf(index),
														1,
													);
													for (
														let i = 0;
														i < t.length;
														i++
													) {
														if (t[i] > index) {
															t[i] -= 1;
														}
													}
													return t;
												});
												setSelected((prev) => {
													const updatedSelected = {
														...JSON.parse(prev),
													};
													const up = {};

													Object.keys(
														updatedSelected,
													).forEach((key) => {
														console.log(key);
														if (
															parseInt(key) >
															index
														) {
															let newIndex =
																parseInt(key) -
																1;
															up[newIndex] =
																updatedSelected[
																	key
																];
														} else if (
															parseInt(key) <
															index
														) {
															up[key] =
																updatedSelected[
																	key
																];
														}
													});

													return JSON.stringify(up);
												});
											}}>
											Remove
										</Button>
									) : (
										<></>
									)
								}
							/>
						</div>
					</li>
				))}
			</ul>

			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					paddingLeft: 22,
					paddingRight: 22,
					justifyContent: 'center',
					paddingTop: 10,
					alignItems: 'center',
					justifyContent: 'space-between',
				}}>
				{advanceMode && LoopMode ? (
					<Button
						style={{
							borderRadius: 4,
							backgroundColor: '#F50',
							borderStyle: 'solid',
							borderColor: '#F50',
							color: 'white',
						}}
						onClick={() => handleOpenModal(true)}>
						Add
					</Button>
				) : (
					<div
						style={{
						
							padding:17
						}}></div>
				)}

				<Modal
					open={openModal}
					onClose={() => handleOpenModal(false)}
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexDirection: 'row',
					}}>
					<div
						style={{
							backgroundColor: 'white',
							width: '50%',
							borderRadius: 10,
						}}>
						<div>
							{listChoice.map((c, id) => (
								<div
									className='pdfChoice'
									onClick={() => {
										setSelected((prev) => {
											let t = { ...JSON.parse(prev) };
											let nb = Object.keys(t).length;
											t[nb] = { type: c, content: {} };

											return JSON.stringify(t);
										});
										setOrderSelection((prev) => [
											...prev,
											prev.length,
										]);
										handleOpenModal(false);
									}}>
									{c}
								</div>
							))}
						</div>
					</div>
				</Modal>
			</div>
		</div>
	);
}
